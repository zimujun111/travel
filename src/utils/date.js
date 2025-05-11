export function formatRelativeTime(timestamp) {
    const now = new Date()
    const date = new Date(timestamp)
    const seconds = Math.floor((now - date) / 1000)
    
    let interval = Math.floor(seconds / 31536000)
    if (interval >= 1) return `${interval}年前`
    
    interval = Math.floor(seconds / 2592000)
    if (interval >= 1) return `${interval}个月前`
    
    interval = Math.floor(seconds / 86400)
    if (interval >= 1) return `${interval}天前`
    
    interval = Math.floor(seconds / 3600)
    if (interval >= 1) return `${interval}小时前`
    
    interval = Math.floor(seconds / 60)
    if (interval >= 1) return `${interval}分钟前`
    
    return '刚刚'
  }