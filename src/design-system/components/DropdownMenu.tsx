// @ts-ignore - React import needed for JSX in non-TypeScript projects
import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Icon } from './Icon';
import './DropdownMenu.css';

/* ============================================================================
   DropdownMenu (Root)
   ============================================================================ */

export interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}

export function DropdownMenu({
  children,
  open,
  defaultOpen,
  onOpenChange,
  modal = true,
}: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      {children}
    </DropdownMenuPrimitive.Root>
  );
}

/* ============================================================================
   DropdownMenuTrigger
   ============================================================================ */

export interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export function DropdownMenuTrigger({
  children,
  asChild = true,
  className = '',
}: DropdownMenuTriggerProps) {
  return (
    <DropdownMenuPrimitive.Trigger asChild={asChild} className={className || undefined}>
      {children}
    </DropdownMenuPrimitive.Trigger>
  );
}

/* ============================================================================
   DropdownMenuContent
   ============================================================================ */

export interface DropdownMenuContentProps {
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  className?: string;
}

export function DropdownMenuContent({
  children,
  side = 'bottom',
  sideOffset = 4,
  align = 'start',
  alignOffset = 0,
  className = '',
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        className={`dropdown-menu-content ${className}`}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

/* ============================================================================
   DropdownMenuItem (Action item)
   ============================================================================ */

export interface DropdownMenuItemProps {
  children: React.ReactNode;
  icon?: string;
  destructive?: boolean;
  disabled?: boolean;
  onSelect?: (event: Event) => void;
  /**
   * Whether the dropdown should close when this item is selected
   * @default true
   */
  closeOnSelect?: boolean;
  className?: string;
}

export function DropdownMenuItem({
  children,
  icon,
  destructive = false,
  disabled = false,
  onSelect,
  closeOnSelect = true,
  className = '',
}: DropdownMenuItemProps) {
  const classes = [
    'dropdown-menu-item',
    destructive && 'dropdown-menu-item--destructive',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleSelect = (event: Event) => {
    if (!closeOnSelect) {
      event.preventDefault();
    }
    onSelect?.(event);
  };

  return (
    <DropdownMenuPrimitive.Item
      className={classes}
      disabled={disabled}
      onSelect={handleSelect}
    >
      {icon && (
        <span className="dropdown-menu-item__icon">
          <Icon name={icon} size={16} />
        </span>
      )}
      <span className="dropdown-menu-item__label">{children}</span>
    </DropdownMenuPrimitive.Item>
  );
}

/* ============================================================================
   DropdownMenuCheckboxItem
   ============================================================================ */

export interface DropdownMenuCheckboxItemProps {
  children: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  onSelect?: (event: Event) => void;
  /**
   * Whether the dropdown should close when this item is selected
   * @default false (checkbox items typically stay open)
   */
  closeOnSelect?: boolean;
  className?: string;
}

export function DropdownMenuCheckboxItem({
  children,
  checked = false,
  onCheckedChange,
  disabled = false,
  onSelect,
  closeOnSelect = false,
  className = '',
}: DropdownMenuCheckboxItemProps) {
  const handleSelect = (event: Event) => {
    if (!closeOnSelect) {
      event.preventDefault();
    }
    onSelect?.(event);
  };

  return (
    <DropdownMenuPrimitive.CheckboxItem
      className={`dropdown-menu-checkbox-item ${className}`}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      onSelect={handleSelect}
    >
      <span className="dropdown-menu-checkbox-item__indicator">
        <Icon
          name={checked ? 'check_box' : 'check_box_outline_blank'}
          size={16}
        />
      </span>
      <span className="dropdown-menu-checkbox-item__label">{children}</span>
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

/* ============================================================================
   DropdownMenuLabel (Section header)
   ============================================================================ */

export interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenuLabel({
  children,
  className = '',
}: DropdownMenuLabelProps) {
  return (
    <DropdownMenuPrimitive.Label className={`dropdown-menu-label ${className}`}>
      {children}
    </DropdownMenuPrimitive.Label>
  );
}

/* ============================================================================
   DropdownMenuSeparator
   ============================================================================ */

export interface DropdownMenuSeparatorProps {
  className?: string;
}

export function DropdownMenuSeparator({ className = '' }: DropdownMenuSeparatorProps) {
  return (
    <DropdownMenuPrimitive.Separator
      className={`dropdown-menu-separator ${className}`}
    />
  );
}

/* ============================================================================
   DropdownMenuSub (Sub-menu)
   ============================================================================ */

export interface DropdownMenuSubProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DropdownMenuSub({
  children,
  open,
  defaultOpen,
  onOpenChange,
}: DropdownMenuSubProps) {
  return (
    <DropdownMenuPrimitive.Sub
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {children}
    </DropdownMenuPrimitive.Sub>
  );
}

/* ============================================================================
   DropdownMenuSubTrigger
   ============================================================================ */

export interface DropdownMenuSubTriggerProps {
  children: React.ReactNode;
  icon?: string;
  disabled?: boolean;
  className?: string;
}

export function DropdownMenuSubTrigger({
  children,
  icon,
  disabled = false,
  className = '',
}: DropdownMenuSubTriggerProps) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      className={`dropdown-menu-item dropdown-menu-sub-trigger ${className}`}
      disabled={disabled}
    >
      {icon && (
        <span className="dropdown-menu-item__icon">
          <Icon name={icon} size={16} />
        </span>
      )}
      <span className="dropdown-menu-item__label">{children}</span>
      <span className="dropdown-menu-sub-trigger__arrow">
        <Icon name="keyboard_arrow_right" size={16} />
      </span>
    </DropdownMenuPrimitive.SubTrigger>
  );
}

/* ============================================================================
   DropdownMenuSubContent
   ============================================================================ */

export interface DropdownMenuSubContentProps {
  children: React.ReactNode;
  sideOffset?: number;
  alignOffset?: number;
  className?: string;
}

export function DropdownMenuSubContent({
  children,
  sideOffset = 0,
  alignOffset = -4,
  className = '',
}: DropdownMenuSubContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        className={`dropdown-menu-content ${className}`}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
      >
        {children}
      </DropdownMenuPrimitive.SubContent>
    </DropdownMenuPrimitive.Portal>
  );
}

/* ============================================================================
   Display names
   ============================================================================ */

DropdownMenu.displayName = 'DropdownMenu';
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';
DropdownMenuContent.displayName = 'DropdownMenuContent';
DropdownMenuItem.displayName = 'DropdownMenuItem';
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';
DropdownMenuLabel.displayName = 'DropdownMenuLabel';
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';
DropdownMenuSub.displayName = 'DropdownMenuSub';
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';

export default DropdownMenu;
