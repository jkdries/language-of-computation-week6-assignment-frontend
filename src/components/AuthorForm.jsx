import { useState } from 'react'

const EMPTY = { first_name: '', last_name: '' }
const FIELDS = [
  { name: 'first_name', label: 'First name', placeholder: 'Ursula' },
  { name: 'last_name', label: 'Last name', placeholder: 'Le Guin' },
]

// Mirrors the backend rules: trimmed, 1–100 characters.
function validate(values) {
  const errors = {}
  for (const { name, label } of FIELDS) {
    const v = values[name].trim()
    if (!v) errors[name] = `${label} is required.`
    else if (v.length > 100) errors[name] = `${label} must be 100 characters or fewer.`
  }
  return errors
}

export default function AuthorForm({ author, onSave, onCancel }) {
  const isEdit = Boolean(author)
  const [values, setValues] = useState(
    isEdit ? { first_name: author.first_name, last_name: author.last_name } : EMPTY,
  )
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  function change(e) {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }))
  }

  async function submit(e) {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length) return

    const payload = { first_name: values.first_name.trim(), last_name: values.last_name.trim() }
    setSaving(true)
    try {
      await onSave(payload)
      if (!isEdit) setValues(EMPTY)
    } catch (err) {
      setErrors(err.fieldErrors ?? {})
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="card author-form" onSubmit={submit} noValidate aria-labelledby="author-form-title">
      <h2 id="author-form-title">{isEdit ? 'Edit author' : 'Add an author'}</h2>

      {FIELDS.map(({ name, label, placeholder }) => (
        <label key={name} className="field">
          {label}
          <input
            type="text"
            name={name}
            value={values[name]}
            onChange={change}
            placeholder={placeholder}
            maxLength={100}
            autoComplete="off"
            aria-invalid={errors[name] ? 'true' : undefined}
            aria-describedby={errors[name] ? `${name}-error` : undefined}
          />
          {errors[name] && (
            <span id={`${name}-error`} className="field-error">
              {errors[name]}
            </span>
          )}
        </label>
      ))}

      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save author'}
        </button>
        {isEdit && (
          <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        )}
      </div>
      <p className="hint">
        {isEdit
          ? `Sends PATCH /authors/${author.id} with the changed names.`
          : 'Sends POST /authors. Names are trimmed and must be 1–100 characters.'}
      </p>
    </form>
  )
}
