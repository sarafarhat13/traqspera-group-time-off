import {
  ModusWcCard,
  ModusWcButtonGroup,
  ModusWcButton,
  ModusWcIcon,
} from '@trimble-oss/moduswebcomponents-react'

export default function ViewToggle({ value = 'calendar', onChange }) {
  return (
    <ModusWcCard bordered customClass="view-toggle-card">
      <div className="-m-3 mb-3 flex items-center gap-2 rounded-t-md bg-primary-700 px-4 py-2 text-sm font-semibold text-white">
        View
      </div>
      <ModusWcButtonGroup
        variant="outlined"
        color="primary"
        selectionType="single"
      >
        <ModusWcButton
          pressed={value === 'calendar'}
          onButtonClick={() => onChange?.('calendar')}
          aria-pressed={value === 'calendar'}
        >
          <ModusWcIcon name="calendar" size="sm" decorative />
          Calendar
        </ModusWcButton>
        <ModusWcButton
          pressed={value === 'list'}
          onButtonClick={() => onChange?.('list')}
          aria-pressed={value === 'list'}
        >
          <ModusWcIcon name="view_list" size="sm" decorative />
          List
        </ModusWcButton>
      </ModusWcButtonGroup>
    </ModusWcCard>
  )
}
