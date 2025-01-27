import React, { useEffect } from 'react'

interface NotificationHandlerProps {
  onPermissionChange: (permission: NotificationPermission) => void
}

const NotificationHandler: React.FC<NotificationHandlerProps> = ({ onPermissionChange }) => {
  useEffect(() => {
    const checkPermission = async () => {
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications')
        return
      }

      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        onPermissionChange(permission)
      } else {
        onPermissionChange(Notification.permission)
      }
    }

    checkPermission()
  }, [onPermissionChange])

  return null
}

export default NotificationHandler
