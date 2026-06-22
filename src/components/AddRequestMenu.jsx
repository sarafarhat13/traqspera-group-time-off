import { useState } from 'react'
import {
  ModusWcDropdownMenu,
  ModusWcMenuItem,
  ModusWcIcon,
} from '@trimble-oss/moduswebcomponents-react'

export default function AddRequestMenu({ onSelect }) {
  const [open, setOpen] = useState(false)

  function choose(kind) {
    setOpen(false)
    onSelect?.(kind)
  }

  return (
    <ModusWcDropdownMenu
      buttonAriaLabel="Add request"
      buttonColor="primary"
      buttonVariant="filled"
      menuPlacement="bottom-end"
      menuSize="md"
      menuVisible={open}
      onMenuVisibilityChange={(e) => setOpen(Boolean(e.detail?.isVisible))}
    >
      <div slot="button" className="flex items-center gap-2">
        <ModusWcIcon name="add" size="sm" decorative />
        Add Request
      </div>
      <div slot="menu">
        <ModusWcMenuItem
          label="Individual Request"
          value="individual"
          onItemSelect={() => choose('individual')}
        >
          <ModusWcIcon slot="start-icon" name="person" size="sm" decorative />
        </ModusWcMenuItem>
        <ModusWcMenuItem
          label="Group Request"
          value="group"
          onItemSelect={() => choose('group')}
        >
          <ModusWcIcon slot="start-icon" name="people_group" size="sm" decorative />
        </ModusWcMenuItem>
      </div>
    </ModusWcDropdownMenu>
  )
}
