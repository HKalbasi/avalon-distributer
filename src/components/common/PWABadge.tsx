import { useRegisterSW } from 'virtual:pwa-register/react'

function PWABadge() {
  const period = 5000

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return
      if (r?.active?.state === 'activated') {
        registerPeriodicSync(period, swUrl, r)
      } else if (r?.installing) {
        r.installing.addEventListener('statechange', e => {
          const sw = e.target as ServiceWorker
          if (sw.state === 'activated') registerPeriodicSync(period, swUrl, r)
        })
      }
    },
  })

  function close() {
    setNeedRefresh(false)
  }

  return (
    <>
      {needRefresh && (
        <div className='fixed bottom-4 right-4 z-50'>
          <div className='alert alert-info shadow-lg'>
            <div>
              <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' className='stroke-current shrink-0 w-6 h-6'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'></path>
              </svg>
              <span>New update available!</span>
            </div>
            <div className='flex-none'>
              <button className='btn btn-sm btn-primary' onClick={() => updateServiceWorker(true)}>
                Update
              </button>
              <button className='btn btn-sm btn-ghost' onClick={() => close()}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PWABadge

function registerPeriodicSync(period: number, swUrl: string, r: ServiceWorkerRegistration) {
  if (period <= 0) return

  setInterval(async () => {
    if ('onLine' in navigator && !navigator.onLine) return

    const resp = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        cache: 'no-store',
        'cache-control': 'no-cache',
      },
    })

    if (resp?.status === 200) await r.update()
  }, period)
}