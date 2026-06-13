export const dynamic = 'force-dynamic';
import Papa from 'papaparse';
import Link from 'next/link';

const CSV_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRT5k044uUWzTbjZgbtRph62shMAJXpHuxp4vAQn0IAr88Hp5R0h0ZWdBYHvcuiH-bgN5hkrEAQswiB/pub?output=csv`;

// युट्युब ID पत्ता लगाउने फङ्सन
function getYoutubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// समाचार डेटा तान्ने फङ्सन
async function getNewsData() {
  try {
    const response = await fetch(CSV_URL, { next: { revalidate: 10 } });
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: false });
    return parsed.data.filter(row => row[1]); // टाइटल भएका रोहरू मात्र लिने
  } catch (error) {
    console.error("Data fetch error:", error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const allNews = await getNewsData();
  const news = allNews[parseInt(id)];

  if (!news) return { title: 'समाचार भेटिएन - ROCK-C Media' };

  const youtubeId = getYoutubeId(news[3]);
  const ogImage = youtubeId 
    ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` 
    : (news[3] || 'https://rockcmediasolution.com/default-logo.png');

  return {
    title: news[1],
    description: news[2].substring(0, 150) + "...",
    openGraph: {
      title: news[1],
      description: news[2].substring(0, 150) + "...",
      images: [{ url: ogImage }],
      type: 'article',
    },
  };
}

export default async function NewsDetailPage({ params }) {
  const { id } = await params;
  const allNews = await getNewsData();
  const currentIndex = parseInt(id);
  const news = allNews[currentIndex];

  if (!news) {
    return <div className="text-center p-10 text-red-500 font-bold">समाचार भेटिएन!</div>;
  }

  const youtubeId = getYoutubeId(news[3]);
  
  // 'यो पनि पढ्नुहोस्' का लागि पछिल्ला ५ समाचार (अहिलेको बाहेक)
  const relatedNews = allNews
    .map((item, index) => ({ title: item[1], id: index }))
    .filter(item => item.id !== currentIndex)
    .reverse()
    .slice(0, 8);

  return (
    <main className="bg-gray-50 min-h-screen pb-20">
      {/* समाचार कार्ड */}
      <div className="max-w-3xl mx-auto bg-white shadow-sm border-x border-gray-200">
        
        {/* मुख्य समाचार सामग्री */}
        <div className="p-6">
          <span className="text-gray-500 text-sm font-medium">{news[0]}</span>
          <h1 className="text-3xl font-bold my-4 text-gray-900 leading-tight">{news[1]}</h1>
          
          {news[3] && (
            <div className="my-6 rounded-lg overflow-hidden bg-black">
              {youtubeId ? (
                <iframe className="w-full aspect-video" src={`https://www.youtube.com/embed/${youtubeId}`} frameBorder="0" allowFullScreen></iframe>
              ) : (
                <img src={news[3]} alt={news[1]} className="w-full h-auto" />
              )}
            </div>
          )}
          
          <div className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap font-light mb-10">
            {news[2]}
          </div>

          {/* Follow Section (हजुरले भन्नुभएको सूचना र लोगोहरू) */}
          <div className="border-t border-gray-100 pt-8 mt-10 text-center">
            <p className="text-gray-700 font-medium mb-4">
              सूचना, मनोरञ्जन र डिजिटल सेवाका लागि <span className="text-blue-600 font-bold">ROCK C Media Solution</span> लाई Follow गर्न नभुल्नुहोस्।
            </p>
            <div className="flex justify-center gap-4 mb-8">
              <a href="https://facebook.com/rockcmedia" target="_blank" className="hover:scale-110 transition-transform">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" width="35" alt="FB" />
              </a>
              <a href="https://youtube.com/@rockcmedia" target="_blank" className="hover:scale-110 transition-transform">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" width="40" alt="YT" />
              </a>
              <a href="https://wa.me/9779811661522" target="_blank" className="hover:scale-110 transition-transform">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="35" alt="WA" />
              </a>
              <a href="https://tiktok.com/@rockcmedia" target="_blank" className="hover:scale-110 transition-transform">
                 <img src="https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg" width="35" alt="TK" />
              </a>
            </div>
          </div>

          {/* 'यो पनि पढ्नुहोस्' Section */}
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-yellow-500"></div>
              <h2 className="text-xl font-bold text-gray-900">यो पनि पढ्नुहोस्</h2>
            </div>
            <div className="space-y-3">
              {relatedNews.map((item) => (
                <Link key={item.id} href={`/news/${item.id}`} className="block p-3 hover:bg-yellow-50 rounded-md border-b border-gray-50 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">❯</span>
                    <span className="text-gray-700 hover:text-blue-600 font-medium">{item.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}