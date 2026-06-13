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

          {/* Follow Section (हजुरले दिनुभएको स्क्रिनसट जस्तै) */}
          <div className="border border-gray-200 rounded-xl p-8 mt-10 mb-10 text-center bg-white shadow-sm">
            <p className="text-gray-800 font-semibold text-lg mb-6 leading-relaxed">
              सूचना, मनोरञ्जन र डिजिटल सेवाका लागि <span className="text-[#205187] font-bold">ROCK C Media Solution</span> लाई Follow गर्न नभुल्नुहोस्।
            </p>
            <div className="flex justify-center gap-4">
              {/* Facebook */}
              <a href="https://www.facebook.com/Rockcmedia/" target="_blank" className="w-12 h-12 bg-[#4267B2] text-white rounded-full flex items-center justify-center hover:-translate-y-1 transition-transform">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>
              </a>
              {/* WhatsApp */}
              <a href="https://wa.me/9779811661522" target="_blank" className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:-translate-y-1 transition-transform">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-7 h-7"><path d="M12.031 21.052c-1.855 0-3.666-.497-5.26-1.442l-.377-.224-3.91.1.258-3.815-.246-.39c-.958-1.522-1.464-3.266-1.464-5.05 0-5.32 4.331-9.65 9.65-9.65 5.32 0 9.65 4.33 9.65 9.65 0 5.32-4.33 9.65-9.65 9.65z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.146 14.502c-.225-.113-1.332-.658-1.538-.733-.205-.075-.355-.113-.505.113-.15.225-.582.733-.713.883-.131.15-.262.168-.487.055-.225-.112-.95-.35-1.81-1.115-.668-.595-1.12-1.33-1.25-1.555-.13-.225-.014-.347.098-.459.102-.102.225-.263.338-.394.113-.131.15-.225.225-.375.075-.15.038-.282-.019-.394-.056-.113-.505-1.218-.692-1.668-.181-.438-.365-.378-.505-.385-.13-.006-.28-.007-.43-.007-.15 0-.394.056-.6.281-.206.225-.788.77-.788 1.875 0 1.105.807 2.173.92 2.323.112.15 1.584 2.417 3.839 3.39.536.232.955.37 1.28.473.538.171 1.027.147 1.413.089.432-.065 1.332-.544 1.52-1.07.188-.526.188-.977.132-1.07-.057-.094-.207-.15-.432-.263z"/></svg>
              </a>
              {/* Email */}
              <a href="mailto:rockcmediasolution@gmail.com" target="_blank" className="w-12 h-12 bg-[#EA4335] text-white rounded-full flex items-center justify-center hover:-translate-y-1 transition-transform">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8L12 13L20 8V18ZM12 11L4 6H20L12 11Z"/></svg>
              </a>
              {/* YouTube */}
              <a href="https://www.youtube.com/@Rock-CMediaSolution" target="_blank" className="w-12 h-12 bg-[#FF0000] text-white rounded-full flex items-center justify-center hover:-translate-y-1 transition-transform">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M21.582 6.186a2.68 2.68 0 0 0-1.884-1.895C17.95 3.84 12 3.84 12 3.84s-5.95 0-7.698.45A2.68 2.68 0 0 0 2.418 6.186C2 7.94 2 12 2 12s0 4.06.418 5.814a2.68 2.68 0 0 0 1.884 1.895c1.748.451 7.698.451 7.698.451s5.95 0 7.698-.45a2.68 2.68 0 0 0 1.884-1.896C22 16.06 22 12 22 12s0-4.06-.418-5.814zM9.8 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
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
                <Link key={item.id} href={`/news/${item.id}`}