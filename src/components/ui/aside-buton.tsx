export function AsideButton({children, onClick}: {children: React.ReactNode, onClick: () => void}) {

  return (
    <button 
      type="button"
      className="flex items-center gap-3 w-full px-4 py-3 my-1 text-left text-slate-600 dark:text-slate-50 rounded-lg hover:bg-slate-100 dark:bg-slate-700 hover:dark:bg-slate-600 transition-colors"
      onClick={onClick}
    >
      {children}
    </button>
  )
}
