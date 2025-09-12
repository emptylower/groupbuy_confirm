import { useState } from 'react'

export default function Home() {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [count, setCount] = useState(0)

  const search = async () => {
    setError('')
    setRows([])
    setCount(0)
    if (!q.trim()) { setError('请输入手机号'); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?phone=${encodeURIComponent(q.trim())}`)
      const data = await res.json()
      if (!data.ok) {
        setError(data.error || '查询失败')
        return
      }
      setHeaders(data.headers || [])
      setRows(data.rows || [])
      setCount(data.count || 0)
    } catch (e) {
      setError('请求失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{maxWidth: 820, margin: '40px auto', padding: 16, fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,PingFang SC,Noto Sans CJK SC,Microsoft YaHei,sans-serif'}}>
      <div style={{background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.03)'}}>
        <h1 style={{marginTop:0}}>收货信息查询（Next.js）</h1>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <input
            value={q}
            onChange={e=>setQ(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter') search() }}
            placeholder="请输入手机号（支持部分匹配，如后4位）"
            style={{flex:1, padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8}}
          />
          <button onClick={search} disabled={loading} style={{padding:'10px 14px', background:'#2979ff', color:'#fff', border:0, borderRadius:8}}>
            {loading ? '查询中…' : '查询'}
          </button>
        </div>
        <div style={{color:'#6b7280', fontSize:14, marginTop:8}}>说明：本页通过 API 读取项目内的 Excel 表（部署到 Vercel 时请将 Excel 一并上传）。</div>
        {error ? <div style={{color:'#d14343', marginTop:8}}>{error}</div> : null}
        <div style={{marginTop:8}}>匹配到 {count} 条结果</div>
        {rows.length > 0 && (
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%', borderCollapse:'collapse', marginTop:16}}>
              <thead>
                <tr>
                  {headers.map((h,i)=> (
                    <th key={i} style={{border:'1px solid #e5e7eb', padding:8, textAlign:'left', background:'#f3f4f6'}}>{String(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r,ri)=> (
                  <tr key={ri}>
                    {headers.map((h,ci)=> (
                      <td key={ci} style={{border:'1px solid #e5e7eb', padding:8, verticalAlign:'top'}}>{String(r[h] ?? '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

