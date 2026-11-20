import { useCallback, useEffect, useRef, useState } from 'react'
import { createAuthor, deleteAuthor, listAuthors, updateAuthor } from '../api.js'
import AuthorForm from '../components/AuthorForm.jsx'
import './AuthorsPage.css'

const PAGE_SIZE = 10

const dateFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

function initials(a) {
  return `${a.first_name[0] ?? ''}${a.last_name[0] ?? ''}`.toUpperCase()
}

export default function AuthorsPage() {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('') // debounced copy of query
  const [offset, setOffset] = useState(0)
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState(null) // author being edited, or null to add
  const [deletingId, setDeletingId] = useState(null)
  const [notice, setNotice] = useState('')
  const noticeTimer = useRef()

  // Wait for typing to pause before searching, and go back to page 1.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query)
      setOffset(0)
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await listAuthors({ q: search, limit: PAGE_SIZE, offset })
      // Deleting the last row on a page leaves it empty: step back one page.
      if (res.items.length === 0 && offset > 0) {
        setOffset(Math.max(0, offset - PAGE_SIZE))
        return
      }
      setData(res)
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, offset])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => () => clearTimeout(noticeTimer.current), [])

  function flash(message) {
    setNotice(message)
    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(''), 4000)
  }

  async function handleSave(values) {
    if (editing) {
      const saved = await updateAuthor(editing.id, values)
      flash(`Saved changes to ${saved.first_name} ${saved.last_name}.`)
      setEditing(null)
    } else {
      const saved = await createAuthor(values)
      flash(`Added ${saved.first_name} ${saved.last_name}.`)
    }
    await load()
  }

  async function handleDelete(author) {
    const name = `${author.first_name} ${author.last_name}`
    if (!window.confirm(`Delete ${name}? This can't be undone.`)) return
    setDeletingId(author.id)
    try {
      await deleteAuthor(author.id)
      if (editing?.id === author.id) setEditing(null)
      flash(`Deleted ${name}.`)
      await load()
    } catch (err) {
      flash(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const { items, total } = data
  const from = total === 0 ? 0 : offset + 1
  const to = offset + items.length

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <h1>Authors</h1>
          <p className="page-sub">GET /authors · POST /authors · PATCH and DELETE /authors/&#123;id&#125;</p>
        </div>
      </div>

      <div className="split">
        <section className="list-col" aria-labelledby="author-list-heading">
          <h2 id="author-list-heading" className="visually-hidden">Author list</h2>
          <label className="search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className="visually-hidden">Search authors</span>
            <input
              type="search"
              placeholder="Search by first or last name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          {notice && (
            <p className="notice" role="status">
              {notice}
            </p>
          )}

          <div className="table-wrap" aria-busy={loading}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Added</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id} className={editing?.id === a.id ? 'is-editing' : undefined}>
                    <td>
                      <div className="name-cell">
                        <span className="avatar" aria-hidden="true">
                          {initials(a)}
                        </span>
                        <span className="name">
                          {a.first_name} {a.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="nowrap">{dateFormat.format(new Date(a.created_at))}</td>
                    <td className="actions">
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => setEditing(a)}
                        aria-label={`Edit ${a.first_name} ${a.last_name}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-link btn-link--danger"
                        onClick={() => handleDelete(a)}
                        disabled={deletingId === a.id}
                        aria-label={`Delete ${a.first_name} ${a.last_name}`}
                      >
                        {deletingId === a.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && !loadError && items.length === 0 && (
              <p className="empty">
                {search ? `No authors match “${search}”.` : 'No authors yet. Add the first one with the form.'}
              </p>
            )}
            {loadError && (
              <div className="load-error" role="alert">
                <p>{loadError}</p>
                <button type="button" className="btn btn--secondary" onClick={load}>
                  Try again
                </button>
              </div>
            )}
          </div>

          <nav aria-label="Pages" className="pager">
            <span>{loading && items.length === 0 ? 'Loading…' : `Showing ${from}–${to} of ${total}`}</span>
            <div className="pager-buttons">
              <button
                type="button"
                className="btn btn--secondary"
                disabled={offset === 0 || loading}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn"
                disabled={to >= total || loading}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next
              </button>
            </div>
          </nav>
        </section>

        <AuthorForm
          key={editing?.id ?? 'new'}
          author={editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      </div>
    </main>
  )
}
