import { Check, Plus, Trash } from '@phosphor-icons/react'
import { type FormEvent, useState } from 'react'
import { useZenStore } from '@/store'

export function NotesPanel() {
  const note = useZenStore((state) => state.note)
  const tasks = useZenStore((state) => state.tasks)
  const addTask = useZenStore((state) => state.addTask)
  const clearCompletedTasks = useZenStore((state) => state.clearCompletedTasks)
  const deleteTask = useZenStore((state) => state.deleteTask)
  const setNote = useZenStore((state) => state.setNote)
  const toggleTask = useZenStore((state) => state.toggleTask)
  const [draft, setDraft] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    addTask(draft)
    setDraft('')
  }

  return (
    <section className="drawer-section">
      <label className="note-block">
        <span>随手笔记</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="写下灵感、摘抄或一个仍然模糊的问题。"
        />
      </label>
      <div className="markdown-preview">{renderPreview(note)}</div>
      <form className="task-form" onSubmit={submit}>
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="添加今日任务" />
        <button type="submit" aria-label="添加任务"><Plus size={18} weight="thin" /></button>
      </form>
      <div className="task-list">
        {tasks.map((task) => (
          <article className={task.done ? 'task done' : 'task'} key={task.id}>
            <button type="button" onClick={() => toggleTask(task.id)} aria-label={task.done ? '标记未完成' : '标记完成'}>
              <Check size={16} weight="thin" />
            </button>
            <span>{task.title}</span>
            <button type="button" onClick={() => deleteTask(task.id)} aria-label="删除任务">
              <Trash size={16} weight="thin" />
            </button>
          </article>
        ))}
      </div>
      <button className="ghost-wide" type="button" onClick={clearCompletedTasks}>清除已完成任务</button>
    </section>
  )
}

function renderPreview(note: string) {
  const lines = note.split('\n').filter(Boolean).slice(0, 5)
  if (lines.length === 0) return <p>支持 **加粗**、`代码`、&gt; 引用，内容自动保存。</p>

  return lines.map((line, lineIndex) => {
    const quote = line.startsWith('>')
    const content = quote ? line.replace(/^>\s?/, '') : line
    const pieces = content.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    const nodes = pieces.map((piece, index) => {
      if (piece.startsWith('**') && piece.endsWith('**')) return <strong key={`${lineIndex}-${index}`}>{piece.slice(2, -2)}</strong>
      if (piece.startsWith('`') && piece.endsWith('`')) return <code key={`${lineIndex}-${index}`}>{piece.slice(1, -1)}</code>
      return <span key={`${lineIndex}-${index}`}>{piece}</span>
    })

    return quote ? <blockquote key={`${lineIndex}-${content}`}>{nodes}</blockquote> : <p key={`${lineIndex}-${content}`}>{nodes}</p>
  })
}
