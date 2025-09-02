import QRCode from 'react-qr-code'
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner'

interface QRCodeSectionProps {
  showQR: boolean
  gameSerialized: string
  isScanning: boolean
  onScan: (result: IDetectedBarcode[]) => void
}

const QRCodeSection = ({ showQR, gameSerialized, isScanning, onScan }: QRCodeSectionProps) => {
  return (
    <>
      {/* QR Code Display */}
      {showQR && (
        <div className='bg-white rounded-2xl shadow-lg p-6 mb-6 border border-[#bdc3c7]/20 animate-slide-in'>
          <h3 className='text-lg font-bold text-[#2c3e50] mb-4 text-center'>Share with Friends</h3>
          <div className='flex justify-center'>
            <div className='bg-white p-4 rounded-xl shadow-inner'>
              <QRCode value={gameSerialized} size={200} bgColor='#ffffff' fgColor='#2c3e50' level='Q' />
            </div>
          </div>
          <p className='text-center text-sm text-[#bdc3c7] mt-4'>Friends can scan this to import your player list</p>
        </div>
      )}

      {/* QR Scanner */}
      {isScanning && (
        <div className='bg-white rounded-2xl shadow-lg p-6 mb-6 border border-[#bdc3c7]/20 animate-slide-in'>
          <h3 className='text-lg font-bold text-[#2c3e50] mb-4'>Scan Friend's QR Code</h3>
          <div className='rounded-xl overflow-hidden'>
            <Scanner onScan={onScan} />
          </div>
          <p className='text-center text-sm text-[#bdc3c7] mt-4'>Point your camera at a friend's QR code</p>
        </div>
      )}
    </>
  )
}

export default QRCodeSection
