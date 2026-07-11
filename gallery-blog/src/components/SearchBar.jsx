export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder=""
      aria-label="Search posts"
      className="search-bar__input"
    />
  )
}
