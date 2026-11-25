import { useState } from 'react'
import useSWR from 'swr'
import { supabase } from '@/lib/supabase'
type Article = { topic:string; keywords:string; answer:string; published:boolean }
const blank:Article = {topic:'', keywords:'', answer:'', published:false}
export function KnowledgeEditor() {
  const [draft,setDraft]=useState(blank), [notice,setNotice]=useState(''), [busy,setBusy]=useState(false)
  const {data,error,mutate}=useSWR('support-knowledge-editor',async()=>{
    const r=await supabase.from('support_knowledge_articles').select('topic,keywords,answer,published').order('topic')
    if(r.error) throw r.error
    return r.data as Article[]
  })
  return <details className="rounded-xl bg-white p-4"><summary>Support knowledge and FAQs</summary>
    {error && <p role="alert">Articles unavailable.</p>}
    <select aria-label="Choose article" value={data?.some(a=>a.topic===draft.topic)?draft.topic:''} onChange={e=>setDraft(data?.find(a=>a.topic===e.target.value)??blank)}>
      <option value="">New article</option>{data?.map(a=><option key={a.topic}>{a.topic}</option>)}</select>
    <form className="grid gap-2" onSubmit={async e=>{e.preventDefault();if(busy)return;setBusy(true)
      try {const r=await supabase.from('support_knowledge_articles').upsert(draft,{onConflict:'topic'});if(r.error)throw r.error;setNotice('Article saved.');await mutate()}catch{setNotice('Save could not be confirmed.')}finally{setBusy(false)}
    }}>
      <label>Topic ID <input required pattern="[a-z][a-z0-9_-]{0,39}" value={draft.topic} onChange={e=>setDraft({...draft,topic:e.target.value})}/></label>
      <label>Search terms (comma separated) <input required maxLength={500} value={draft.keywords} onChange={e=>setDraft({...draft,keywords:e.target.value})}/></label>
      <label>Approved answer <textarea required maxLength={1800} value={draft.answer} onChange={e=>setDraft({...draft,answer:e.target.value})}/></label>
      <label><input type="checkbox" checked={draft.published} onChange={e=>setDraft({...draft,published:e.target.checked})}/> Published</label>
      <button disabled={busy}>Save article</button><output>{notice}</output>
    </form></details>
}
