import React from 'react';
interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}
export function TierBadge({
  tier,
  className = ''



}: {tier: 'free' | 'professional' | 'enterprise';className?: string;}) {
  const styles = {
    free: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    professional:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
    enterprise:
    'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 relative overflow-hidden'
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[tier]} ${className}`}>
      
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
      {tier === 'enterprise' &&
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
      }
    </span>);

}
export function RoleBadge({
  role,
  className = ''



}: {role: 'admin' | 'user' | 'read_only';className?: string;}) {
  const styles = {
    admin: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
    user: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    read_only: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
  };
  const label =
  role === 'read_only' ?
  'Read Only' :
  role.charAt(0).toUpperCase() + role.slice(1);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[role]} ${className}`}>
      
      {label}
    </span>);

}
export function StatusPill({
  status,
  className = ''



}: {status: 'active' | 'pending_deletion' | 'deleted';className?: string;}) {
  const styles = {
    active:
    'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
    pending_deletion:
    'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    deleted:
    'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 opacity-75'
  };
  const label = status.
  split('_').
  map((w) => w.charAt(0).toUpperCase() + w.slice(1)).
  join(' ');
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]} ${className}`}>
      
      {label}
    </span>);

}
export function EventBadge({
  type,
  className = ''



}: {type: 'auth' | 'key' | 'destructive' | 'system';className?: string;}) {
  const styles = {
    auth: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    key: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
    destructive: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
    system: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[type]} ${className}`}>
      
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>);

}