import { useState, useMemo } from 'react'
import { Friend } from '../../types'
import FriendsList from './FriendsList'

interface FriendsManagerProps {
  friends: Friend[]
  onAddFriend: () => void
  onBatchAddFriends: () => void
  onToggleFriend: (friendName: string) => void
  onRemoveFriend: (friendName: string) => void
  onClearAll: () => void
  onExportQR: () => void
  onImportQR: () => void
  isScanning: boolean
}

const FriendsManager = ({
  friends,
  onAddFriend,
  onBatchAddFriends,
  onToggleFriend,
  onRemoveFriend,
  onClearAll,
  onExportQR,
  onImportQR,
  isScanning,
}: FriendsManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFriends = useMemo(() => {
    return friends.filter(friend => friend.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [friends, searchTerm])

  return (
    <div className='bg-white rounded-2xl shadow-lg p-6 mb-6 border border-[#bdc3c7]/20 animate-slide-in'>
      <h2 className='text-xl font-bold text-[#2c3e50] mb-4'>Friends Management</h2>

      {/* Search and Add */}
      <div className='flex gap-2 mb-4'>
        <input
          type='text'
          placeholder='Search friends...'
          className='input input-bordered flex-1 bg-gray-50 border-[#bdc3c7]/30 focus:border-[#1abc9c]'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button className='btn btn-custom-primary' onClick={onAddFriend}>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='w-5 h-5'>
            <path d='M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z' />
          </svg>
        </button>
      </div>

      {/* Friends List */}
      <FriendsList friends={filteredFriends} onToggleFriend={onToggleFriend} onRemoveFriend={onRemoveFriend} />

      {/* Import/Export Actions */}
      <div className='grid grid-cols-2 gap-2 mb-2'>
        <button className='btn btn-custom-outline btn-sm' onClick={onExportQR}>
          Export QR
        </button>
        <button className='btn btn-custom-outline btn-sm' onClick={onImportQR}>
          {isScanning ? 'Stop Scan' : 'Import QR'}
        </button>
      </div>
      <div className='grid grid-cols-2 gap-2'>
        <button className='btn btn-custom-outline btn-sm' onClick={onBatchAddFriends}>
          Batch Add
        </button>
        <button className='btn btn-custom-outline btn-sm' onClick={onClearAll}>
          Clear All
        </button>
      </div>
    </div>
  )
}

export default FriendsManager
