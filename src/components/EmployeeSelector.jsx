import { useMemo, useState } from 'react'
import { Search, X, Users, CheckCircle2 } from 'lucide-react'
import {
  EMPLOYEES,
  UNIONS,
  DEPARTMENTS,
  COST_CENTERS,
  ROLES,
} from '../data/mockData'

function FilterMultiSelect({ label, options, value, onChange }) {
  function toggle(opt) {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt))
    } else {
      onChange([...value, opt])
    }
  }
  return (
    <details className="group rounded-md border border-secondary-200 bg-white open:shadow-xs">
      <summary className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50">
        <span className="flex items-center gap-2">
          {label}
          {value.length > 0 && (
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
              {value.length}
            </span>
          )}
        </span>
        <span className="text-xs text-secondary-400 group-open:rotate-180 transition">▾</span>
      </summary>
      <div className="max-h-48 overflow-y-auto scrollbar-thin border-t border-secondary-100 px-2 py-2">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm text-secondary-700 hover:bg-secondary-50"
          >
            <input
              type="checkbox"
              checked={value.includes(opt)}
              onChange={() => toggle(opt)}
              className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="truncate">{opt}</span>
          </label>
        ))}
      </div>
    </details>
  )
}

export default function EmployeeSelector({ selectedIds, onChange }) {
  const [search, setSearch] = useState('')
  const [unions, setUnions] = useState([])
  const [departments, setDepartments] = useState([])
  const [costCenters, setCostCenters] = useState([])
  const [roles, setRoles] = useState([])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return EMPLOYEES.filter((e) => {
      if (q && !`${e.name} ${e.employeeNumber} ${e.email}`.toLowerCase().includes(q)) {
        return false
      }
      if (unions.length && !unions.includes(e.union)) return false
      if (departments.length && !departments.includes(e.department)) return false
      if (costCenters.length && !costCenters.includes(e.costCenter)) return false
      if (roles.length && !roles.includes(e.role)) return false
      return true
    })
  }, [search, unions, departments, costCenters, roles])

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((e) => selectedIds.includes(e.id))

  function toggleEmployee(id) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  function selectAllFiltered() {
    if (allFilteredSelected) {
      const filteredIds = new Set(filtered.map((e) => e.id))
      onChange(selectedIds.filter((id) => !filteredIds.has(id)))
    } else {
      const merged = new Set([...selectedIds, ...filtered.map((e) => e.id)])
      onChange(Array.from(merged))
    }
  }

  function clearAll() {
    setUnions([])
    setDepartments([])
    setCostCenters([])
    setRoles([])
    setSearch('')
  }

  const activeFilters =
    unions.length + departments.length + costCenters.length + roles.length

  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-secondary-500" />
          <h3 className="text-sm font-semibold text-secondary-800">Select Employees</h3>
          <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-medium text-secondary-700">
            {selectedIds.length} selected
          </span>
        </div>
        {activeFilters > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:text-primary-800"
          >
            <X className="h-3 w-3" /> Clear filters
          </button>
        )}
      </div>

      <div className="grid min-h-0 grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside className="card flex flex-col overflow-hidden">
          <div className="border-b border-secondary-200 bg-secondary-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-secondary-600">
            Filters
          </div>
          <div className="space-y-2 overflow-y-auto scrollbar-thin p-3">
            <FilterMultiSelect
              label="Union"
              options={UNIONS}
              value={unions}
              onChange={setUnions}
            />
            <FilterMultiSelect
              label="Department"
              options={DEPARTMENTS}
              value={departments}
              onChange={setDepartments}
            />
            <FilterMultiSelect
              label="Cost Center"
              options={COST_CENTERS}
              value={costCenters}
              onChange={setCostCenters}
            />
            <FilterMultiSelect
              label="Role"
              options={ROLES}
              value={roles}
              onChange={setRoles}
            />
          </div>
        </aside>

        {/* Employee list */}
        <div className="card flex min-h-0 flex-col overflow-hidden">
          <div className="flex items-center gap-2 border-b border-secondary-200 px-3 py-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or employee #"
                className="input pl-9"
                aria-label="Search employees"
              />
            </div>
            <button
              type="button"
              onClick={selectAllFiltered}
              className="btn-ghost whitespace-nowrap text-xs"
              disabled={filtered.length === 0}
            >
              {allFilteredSelected ? 'Deselect all' : 'Select all'}
              <span className="ml-1 text-secondary-400">({filtered.length})</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8 text-sm text-secondary-500">
                No employees match the current filters.
              </div>
            ) : (
              <ul role="list" className="divide-y divide-secondary-100">
                {filtered.map((emp) => {
                  const checked = selectedIds.includes(emp.id)
                  return (
                    <li key={emp.id}>
                      <label
                        className={`flex cursor-pointer items-center gap-3 px-3 py-2 transition ${
                          checked ? 'bg-primary-50/60' : 'hover:bg-secondary-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleEmployee(emp.id)}
                          className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-200 text-xs font-semibold text-secondary-700">
                          {emp.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium text-secondary-900">
                              {emp.name}
                            </span>
                            <span className="rounded bg-secondary-100 px-1.5 py-0.5 font-mono text-[10px] text-secondary-600">
                              #{emp.employeeNumber}
                            </span>
                          </div>
                          <div className="truncate text-xs text-secondary-500">
                            {emp.role} · {emp.department} · {emp.costCenter}
                          </div>
                        </div>
                        <span className="hidden truncate text-xs text-secondary-500 sm:inline">
                          {emp.union}
                        </span>
                        {checked && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-600" />
                        )}
                      </label>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
