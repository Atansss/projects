import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function TagManager({ allTags, selected, onChange, onTagCreated }) {
  const [input, setInput] = useState('')

  function addTag(name) {
    const clean = name.trim()
    if (!clean || selected.includes(clean)) return
    onChange([...selected, clean])
    setInput('')
  }

  function removeTag(name) {
    onChange(selected.filter((t) => t !== name))
  }

  async function handleCreate(e) {
    e.preventDefault()
    const clean = input.trim()
    if (!clean) return

    addTag(clean)

    const exists = allTags.some((t) => t.name.toLowerCase() === clean.toLowerCase())
    if (!exists) {
      const { data } = await supabase.from('tags').insert({ name: clean }).select().single()
      if (data) onTagCreated?.(data)
    }
  }

  return (
    <div className="tag-manager">
      <div className="tag-manager__selected">
        {selected.map((tag) => (
          <span key={tag} className="tag-pill tag-pill--removable">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
              ✕
            </button>
          </span>
        ))}
      </div>

      <form onSubmit={handleCreate} className="tag-manager__input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a tag and press enter…"
        />
        <button type="submit" className="btn btn--ghost">
          Add
        </button>
      </form>

      {allTags.length > 0 && (
        <div className="tag-manager__suggestions">
          {allTags
            .filter((t) => !selected.includes(t.name))
            .map((t) => (
              <button
                type="button"
                key={t.id}
                className="tag-filter__chip"
                onClick={() => addTag(t.name)}
              >
                + {t.name}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
