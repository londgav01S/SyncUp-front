export function formatDuration(sec){
  if(!sec) return '0:00'
  const m = Math.floor(sec/60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2,'0')}`
}

export function isYouTubeUrl(url){
  if(!url) return false
  try{
    const u = new URL(url)
    return (
      u.hostname.includes('youtube.com') ||
      u.hostname.includes('youtu.be')
    )
  }catch(e){
    return false
  }
}
