interface UserInfoProps {
  userName: string
  onChangeName: () => void
}

const UserInfo = ({ userName, onChangeName }: UserInfoProps) => {
  return (
    <div className='bg-white rounded-2xl shadow-lg p-6 mb-6 border border-[#bdc3c7]/20'>
      <div className='flex justify-between items-center'>
        <div>
          <p className='text-sm text-[#bdc3c7]'>Your Name</p>
          <p className='text-xl font-bold text-[#2c3e50]'>{userName}</p>
        </div>
        <button className='p-2 rounded-lg hover:bg-gray-100 transition-colors' onClick={onChangeName}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='w-5 h-5 text-[#2c3e50]'
          >
            <path d='M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z' />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default UserInfo
