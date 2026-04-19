export default function PreferenceChip({ label, Icon, selected, onClick }) {
  return (
    <button
      type="button"
      className={`chip ${selected ? 'chip--selected' : ''}`}
      onClick={onClick}
    >
      {Icon && (
        <span className="chip__icon" aria-hidden>
          <Icon size={17} />
        </span>
      )}
      {label}
    </button>
  )
}
