export const dynamic = 'force-dynamic';
import Papa from 'papaparse';
const CSV_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRT5k044uUWzTbjZgbtRph62shMAJXpHuxp4vAQn0IAr88Hp5R0h0ZWdBYHvcuiH-bgN5hkrEAQswiB/pub?output=csv`;

// युट्युब लिङ्कबाट भिडियोको ID पत्ता लगाउने फङ्सन
function getYoutubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

async function fetchSingleNews(id) {
  try {
    const response = await fetch(CSV_URL, { next: { revalidate: 10 } }); 
    const csvText = await response.text();
    
    const parsed = Papa.parse(csvText, { header: false });
    const rows = parsed.data;
    const newsId = parseInt(id);

    if (!rows[newsId]) return null;

    return {
      date: rows[newsId][0] || '',       
      title: rows[newsId][1] || '',      
      desc: rows[newsId][2] || '',       
      mediaLink: rows[newsId][3] || ''   
    };
  } catch (error) {
    console.error("Data fetch error:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params; 
  const { id } = resolvedParams;
  const news = await fetchSingleNews(id);

  if (!news) {
    return { title: 'समाचार भेटिएन - ROCK-C Media' };
  }

  // यदि युट्युब भिडियो हो भने, थम्बनेलको लिङ्क आफैँ बनाउने
  const youtubeId = getYoutubeId(news.mediaLink);
  const ogImage = youtubeId 
    ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` 
    : (news.mediaLink || 'https://rockcmediasolution.com/default-logo.png');

  return {
    title: news.title,
    description: news.desc.substring(0, 150) + "...",
    openGraph: {
      title: news.title,
      description: news.desc.substring(0, 150) + "...",
      url: `https://rockcmediasolution.com/news/${id}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: news.title }],
      type: 'article',
    },
  };
}

export default async function NewsDetailPage({ params }) {
  const resolvedParams = await params; 
  const { id } = resolvedParams;
  const news = await fetchSingleNews(id);

  if (!news) {
    return <div className="text-center p-10 text-red-500 font-bold">समाचार भेटिएन! (कृपया सहि ID हान्नुहोस्)</div>;
  }

  const youtubeId = getYoutubeId(news.mediaLink);

  return (
    <main className="max-w-3xl mx-auto p-5 my-10 bg-white shadow-lg rounded-xl border border-gray-100">
      <span className="text-gray-400 text-sm font-semibold block mb-2">{news.date}</span>
      <h1 className="text-3xl font-bold my-4 text-gray-900 leading-tight">{news.title}</h1>
      
      {news.mediaLink && (
        <div className="my-6 overflow-hidden rounded-lg shadow-md">
          {youtubeId ? (
            /* युट्युब भिडियो देखाउने प्लेयर */
            <iframe
              className="w-full aspect-video"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={news.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            /* साधारण फोटो देखाउने */
            <img src={news.mediaLink} alt={news.title} className="w-full h-auto object-cover" />
          )}
        </div>
      )}
      
      <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
        {news.desc}
      </p>
    </main>
  );
}