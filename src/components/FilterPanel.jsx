import { useState } from 'react'
import {
  ModusWcCard,
  ModusWcDate,
  ModusWcSelect,
  ModusWcIcon,
  ModusWcButton,
} from '@trimble-oss/moduswebcomponents-react'

const EMPLOYEE_OPTIONS = [
  { label: 'All employees', value: '' },
  { label: 'Sara Farhat', value: 'sara' },
  { label: 'John Smith', value: 'john' },
]

const STATUS_OPTIONS = [
  { label: 'Any status', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Declined', value: 'declined' },
]

const TYPE_OPTIONS = [
  { label: 'All types', value: '' },
  { label: 'Paid Time Off', value: 'pto' },
  { label: 'Sick Day', value: 'sick' },
  { label: 'Vacation', value: 'vacation' },
  { label: 'Holiday', value: 'holiday' },
]

const APPROVER_OPTIONS = [
  { label: 'Anyone', value: '' },
  { label: 'Alex Morgan', value: 'alex' },
  { label: 'Priya Patel', value: 'priya' },
]

export default function FilterPanel() {
  const [open, setOpen] = useState(true)
  const [date, setDate] = useState('2026-07-03')
  const [employee, setEmployee] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [approver, setApprover] = useState('')

  return (
    <ModusWcCard bordered customClass="filter-panel">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="-m-3 mb-3 flex w-[calc(100%+1.5rem)] items-center justify-between border-b border-secondary-200 px-4 py-2.5 text-left text-sm font-semibold text-secondary-800 hover:bg-secondary-50"
      >
        <span>Filter</span>
        <ModusWcIcon
          name={open ? 'expand_less' : 'expand_more'}
          size="sm"
          decorative
        />
      </button>
      {open && (
        <div className="space-y-3">
          <ModusWcDate
            label="Date Range"
            size="md"
            value={date}
            onInputChange={(e) => setDate(e.detail?.target?.value ?? '')}
          />
          <ModusWcSelect
            label="Employee"
            size="md"
            options={EMPLOYEE_OPTIONS}
            value={employee}
            onInputChange={(e) => setEmployee(e.detail?.target?.value ?? '')}
          />
          <ModusWcSelect
            label="Status"
            size="md"
            options={STATUS_OPTIONS}
            value={status}
            onInputChange={(e) => setStatus(e.detail?.target?.value ?? '')}
          />
          <ModusWcSelect
            label="Type"
            size="md"
            options={TYPE_OPTIONS}
            value={type}
            onInputChange={(e) => setType(e.detail?.target?.value ?? '')}
          />
          <ModusWcSelect
            label="Requested Approver"
            size="md"
            options={APPROVER_OPTIONS}
            value={approver}
            onInputChange={(e) => setApprover(e.detail?.target?.value ?? '')}
          />
          <ModusWcButton
            variant="outlined"
            color="secondary"
            size="sm"
            fullWidth
            onButtonClick={() => {
              setDate('')
              setEmployee('')
              setStatus('')
              setType('')
              setApprover('')
            }}
          >
            <ModusWcIcon name="filter_off" size="sm" decorative />
            Clear filters
          </ModusWcButton>
        </div>
      )}
    </ModusWcCard>
  )
}
