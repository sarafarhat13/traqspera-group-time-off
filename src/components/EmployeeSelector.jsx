import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ModusWcTextInput,
  ModusWcCheckbox,
  ModusWcButton,
  ModusWcIcon,
  ModusWcChip,
  ModusWcAvatar,
} from '@trimble-oss/moduswebcomponents-react'
import {
  EMPLOYEES,
  UNIONS,
  DEPARTMENTS,
  COST_CENTERS,
  ROLES,
} from '../data/mockData'

function FilterMultiSelect({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function onEsc(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  function toggle(opt) {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt))
    } else {
      onChange([...value, opt])
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-2 rounded-md border bg-white px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 sm:w-auto ${
          value.length > 0
            ? 'border-primary-500 text-primary-700'
            : 'border-secondary-300 text-secondary-700 hover:bg-secondary-50'
        }`}
      >
        <span className="flex items-center gap-2">
          {label}
          {value.length > 0 && (
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
              {value.length}
            </span>
          )}
        </span>
        <ModusWcIcon
          name={open ? 'expand_less' : 'expand_more'}
          size="sm"
          decorative
        />
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-1 w-56 rounded-md border border-secondary-200 bg-white shadow-lg">
          <div className="border-b border-secondary-100 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-500">
            {label}
          </div>
          <div className="max-h-56 overflow-y-auto scrollbar-thin px-2 py-2 space-y-1">
            {options.map((opt) => (
              <div
                key={opt}
                className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 hover:bg-secondary-50"
                onClick={() => toggle(opt)}
              >
                <ModusWcCheckbox
                  value={value.includes(opt)}
                  onInputChange={(e) => {
                    e.stopPropagation?.()
                    toggle(opt)
                  }}
                  aria-label={opt}
                />
                <span className="truncate text-sm text-secondary-700">{opt}</span>
              </div>
            ))}
          </div>
          {value.length > 0 && (
            <div className="flex items-center justify-between border-t border-secondary-100 px-2 py-1.5">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-medium text-secondary-600 hover:text-secondary-800"
              >
                Clear
              </button>
              <span className="text-xs text-secondary-500">
                {value.length} selected
              </span>
            </div>
          )}
        </div>
      )}
    </div>
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
    <div className="grid h-full grid-rows-[auto_auto_1fr] gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ModusWcIcon name="people_group" size="sm" decorative />
          <h3 className="text-sm font-semibold text-secondary-800">Select Employees</h3>
          <ModusWcChip
            label={`${selectedIds.length} selected`}
            size="sm"
            variant="filled"
          />
        </div>
        {activeFilters > 0 && (
          <ModusWcButton variant="borderless" color="secondary" size="sm" onButtonClick={clearAll}>
            <ModusWcIcon name="close" size="sm" decorative />
            Clear filters
          </ModusWcButton>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-md border border-secondary-200 bg-white p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex-1">
            <ModusWcTextInput
              type="text"
              includeSearch
              includeClear
              value={search}
              placeholder="Search by name or employee #"
              aria-label="Search employees"
              onInputChange={(e) => setSearch(e.detail?.target?.value ?? '')}
              onClearClick={() => setSearch('')}
            />
          </div>
          <ModusWcButton
            variant="borderless"
            color="secondary"
            size="sm"
            disabled={filtered.length === 0}
            onButtonClick={selectAllFiltered}
            customClass="sm:ml-auto"
          >
            {allFilteredSelected ? 'Deselect all' : 'Select all'}
            <span className="ml-1 text-secondary-400">({filtered.length})</span>
          </ModusWcButton>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary-500">
            <ModusWcIcon name="filter_list" size="sm" decorative />
            <span className="uppercase tracking-wide">Filters</span>
          </div>
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
      </div>

      <div className="flex min-h-0 flex-col overflow-hidden rounded-md border border-secondary-200 bg-white">
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
                    <div
                      className={`flex cursor-pointer items-center gap-3 px-3 py-2 transition ${
                        checked ? 'bg-primary-50/60' : 'hover:bg-secondary-50'
                      }`}
                      onClick={() => toggleEmployee(emp.id)}
                    >
                      <ModusWcCheckbox
                        value={checked}
                        aria-label={`Select ${emp.name}`}
                        onInputChange={(e) => {
                          e.stopPropagation?.()
                          toggleEmployee(emp.id)
                        }}
                      />
                      <ModusWcAvatar
                        alt={emp.name}
                        size="sm"
                        shape="circle"
                      />
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
                        <ModusWcIcon
                          name="check_circle"
                          size="sm"
                          decorative
                          customClass="text-primary-600"
                        />
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
