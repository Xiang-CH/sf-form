'use client'
import { useEffect, useState } from "react"
import { Share2Icon, PlusIcon } from "@radix-ui/react-icons"

const DISMISS_KEY = 'pwa-install-prompt-dismissed'

export default function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)
    const [showPrompt, setShowPrompt] = useState(false)
   
    useEffect(() => {
      setIsIOS(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
      )
   
      setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

      const dismissed = localStorage.getItem(DISMISS_KEY)
      if (!dismissed) {
          setShowPrompt(true)
      }
    }, [])
   
    const handleDismiss = () => {
        localStorage.setItem(DISMISS_KEY, 'true')
        setShowPrompt(false)
    }

    if ( isStandalone || !showPrompt || !isIOS) {
      return null // Don't show install button if already installed or dismissed/not showing
    }
   
    return (
      <div className="fixed inset-0 bg-gray-500/50 flex items-end justify-center z-50 pb-10 px-4">
        <div className="bg-[var(--card)] p-5 rounded-lg text-center relative max-w-sm">
          <h3 className="text-xl mb-3 font-bold">添加到主屏幕更方便！</h3>
          {isIOS && (
            <div>
              <p>
               1. 在 Safari 中点击<Share2Icon className="inline mx-2 w-6 h-6 mb-1 " />
              </p>
              <p>
                2. 然后选择<PlusIcon className="inline mx-2 w-6 h-6 mb-1" />即可添加到主屏幕
              </p>
            </div>
          )}
          <button onClick={handleDismiss} className="mt-4 px-4 py-2 border-none rounded cursor-pointer bg-gray-200 dark:bg-gray-600/90">
            不再提醒
          </button>
        </div>
      </div>
    )
  }

