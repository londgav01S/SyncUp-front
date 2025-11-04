import { useState, useEffect } from 'react'
import axios from '../api/axiosConfig'

export default function useFetch(url, deps = []){
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    axios.get(url).then(res=>{
      if(mounted){ setData(res.data); setError(null) }
    }).catch(err=>{ if(mounted) setError(err) }).finally(()=>{ if(mounted) setLoading(false) })
    return ()=>{ mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
