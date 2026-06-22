import {
  ModusWcSideNavigation,
  ModusWcMenu,
  ModusWcMenuItem,
  ModusWcIcon,
} from '@trimble-oss/moduswebcomponents-react'

const NAV_ITEMS = [
  { id: 'profile', icon: 'person', label: 'My Profile' },
  { id: 'time', icon: 'clock', label: 'Time' },
  { id: 'team', icon: 'people_group', label: 'Team' },
  { id: 'projects', icon: 'briefcase', label: 'Projects' },
  { id: 'crews', icon: 'hard_hat', label: 'Crews' },
  { id: 'reports', icon: 'bar_graph', label: 'Reports' },
  { id: 'docs', icon: 'file', label: 'Documents' },
  { id: 'tools', icon: 'wrench', label: 'Tools' },
  { id: 'settings', icon: 'settings', label: 'Settings', selected: true },
  { id: 'admin', icon: 'manage_accounts', label: 'Admin' },
]

export default function Sidebar({ expanded = false, onExpandedChange }) {
  return (
    <ModusWcSideNavigation
      expanded={expanded}
      onExpandedChange={(e) => onExpandedChange?.(e.detail)}
      mode="overlay"
      collapseOnClickOutside={true}
      maxWidth="240px"
      customClass="traqspera-sidenav"
    >
      <ModusWcMenu size="md" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => (
          <ModusWcMenuItem
            key={item.id}
            label={item.label}
            value={item.id}
            selected={item.selected || false}
          >
            <ModusWcIcon slot="start-icon" name={item.icon} decorative />
          </ModusWcMenuItem>
        ))}
      </ModusWcMenu>
    </ModusWcSideNavigation>
  )
}
