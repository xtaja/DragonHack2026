export default function PreferenceChip({ label, emoji, selected, onClick }) {
  return (
    <button
      type="button"
      className={`chip ${selected ? 'chip--selected' : ''}`}
      onClick={onClick}
    >
      {emoji && <span className="chip__emoji">{emoji}</span>}
      {label}
    </button>
  )
}
