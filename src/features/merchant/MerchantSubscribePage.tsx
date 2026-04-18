import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppStore } from '../../shared/store/appStore'

import './merchantSubscribePage.css'
import { createPaymentUrl } from '../../api/services/payment'

// Giải mã JWT để lấy merchantId
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

const subscriptionPlans = [
  {
    id: 'basic',
    name: 'Cơ bản',
    price: 500000,
    duration: 30,
    features: [
      'Đăng tải lên 10 địa điểm',
      'Thống kê cơ bản',
      'Hỗ trợ email',
      'Audio giới thiệu cơ bản'
    ],
    color: '#8B7355',
    icon: '🌱'
  },
  {
    id: 'pro',
    name: 'Chuyên nghiệp',
    price: 1500000,
    duration: 30,
    features: [
      'Đăng tải không giới hạn',
      'Thống kê nâng cao',
      'Hỗ trợ ưu tiên',
      'Audio chất lượng cao',
      'Voucher & khuyến mãi',
      'Ưu tiên hiển thị'
    ],
    popular: true,
    color: '#B85C38',
    icon: '🚀'
  },
  {
    id: 'enterprise',
    name: 'Doanh nghiệp',
    price: 5000000,
    duration: 30,
    features: [
      'Tất cả tính năng Pro',
      'API tích hợp',
      'Hỗ trợ 24/7',
      'Tùy chỉnh giao diện',
      'Quản lý đa chi nhánh',
      'Báo cáo chuyên sâu'
    ],
    color: '#8B3A3A',
    icon: '🏢'
  }
]

export function MerchantSubscribePage() {
  const [searchParams] = useSearchParams()
  const showToast = useAppStore((s) => s.showToast)
  const [selectedPlan, setSelectedPlan] = useState<typeof subscriptionPlans[0] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Kiểm tra callback từ VNPay
  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode')
    const orderInfo = searchParams.get('vnp_OrderInfo')
    
    if (responseCode && orderInfo) {
      handlePaymentCallback()
    }
  }, [searchParams])

  const handlePaymentCallback = async () => {
    setIsLoading(true)
    try {
      // TODO: Hiện tại payment.ts không có verifyPayment, cần bổ sung nếu muốn xác thực callback
      // const result = await verifyPayment(params)
      const result = { success: true } // Giả lập thành công
      if (result.success) {
        showToast({ 
          title: '🎉 Thanh toán thành công!', 
          message: 'Gói dịch vụ đã được kích hoạt. Vui lòng đăng nhập lại.' 
        })
        setTimeout(() => {
          window.location.href = '/merchant/login'
        }, 2000)
      } else {
        showToast({ 
          title: 'Thanh toán thất bại', 
          message: 'Vui lòng thử lại hoặc liên hệ hỗ trợ.' 
        })
      }
    } catch (error) {
      showToast({ title: 'Có lỗi xảy ra', message: 'Vui lòng thử lại sau.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectPlan = (plan: typeof subscriptionPlans[0]) => {
    setSelectedPlan(plan)
  }

  const handlePayment = async () => {
    if (!selectedPlan) {
      showToast({ title: 'Chọn gói', message: 'Vui lòng chọn gói đăng ký trước khi thanh toán.' })
      return
    }

    setIsProcessing(true)
    try {
      // Lấy userToken từ localStorage
      const userToken = localStorage.getItem('userToken') || useAppStore.getState().userToken
      const payload = userToken ? parseJwt(userToken) : null
      const merchantId = payload && (payload.merchantId || payload.sub || payload.id)
      console.log('Parsed JWT payload:', payload, 'Extracted merchantId:', merchantId)
        if (!merchantId) {
        showToast({ title: 'Lỗi', message: 'Không tìm thấy thông tin merchant. Vui lòng đăng nhập lại.' })
        setIsProcessing(false)
        return
      }
      const orderInfo = `Thanh toán gói ${selectedPlan.name} cho merchant ${merchantId}`
      const amount = selectedPlan.price
      console.log('Creating payment with params:', { actor_type: 'MERCHANT', actor_id: merchantId, amount, orderInfo })
      const response = await createPaymentUrl({
        actor_type: 'MERCHANT',
        actor_id: merchantId,
        amount,
        orderInfo,
      })
      if (response.url) {
        window.location.href = response.url
      } else {
        showToast({ title: 'Lỗi', message: 'Không thể tạo thanh toán. Vui lòng thử lại.' })
      }
    } catch (error) {
      showToast({ title: 'Lỗi', message: 'Có lỗi xảy ra. Vui lòng thử lại sau.' })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      {/* CSS moved to merchantSubscribePage.css */}
      <div className="subscribe-root">
        <div className="subscribe-header">
          <div className="subscribe-header-content">
            <div className="subscribe-logo">FoodMap</div>
            <h1 className="subscribe-title">Chọn gói phù hợp với bạn</h1>
            <p className="subscribe-subtitle">
              Đăng ký ngay hôm nay để đưa nhà hàng của bạn lên bản đồ ẩm thực 
              và tiếp cận hàng ngàn thực khách mỗi ngày
            </p>
          </div>
        </div>

        <div className="subscribe-main">
          <div className="plans-grid">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`plan-card ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                onClick={() => handleSelectPlan(plan)}
              >
                {plan.popular && <div className="plan-popular">🔥 Phổ biến nhất</div>}
                <div className="plan-icon">{plan.icon}</div>
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="plan-price-amount">{plan.price.toLocaleString()}đ</span>
                  <span className="plan-price-unit"> / {plan.duration} ngày</span>
                </div>
                <ul className="plan-features">
                {plan.features.map((feature: string, idx: number) => (
                    <li key={idx} className="plan-feature">
                    <span className="plan-feature-check">✓</span>
                    <span>{feature}</span>
                    </li>
                ))}
                </ul>
                <button
                  className={`plan-select-btn ${
                    selectedPlan?.id === plan.id
                      ? 'plan-select-btn-selected'
                      : 'plan-select-btn-default'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectPlan(plan)
                  }}
                >
                  {selectedPlan?.id === plan.id ? '✓ Đã chọn' : 'Chọn gói này'}
                </button>
              </div>
            ))}
          </div>

          {selectedPlan && (
            <div className="payment-summary">
              <h3 className="summary-title">💳 Thông tin thanh toán</h3>
              <div className="summary-row">
                <span className="summary-label">Gói đăng ký</span>
                <span className="summary-value">{selectedPlan.name}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Thời hạn</span>
                <span className="summary-value">{selectedPlan.duration} ngày</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Phương thức</span>
                <span className="summary-value">VNPay (Thẻ ATM/VISA/Mastercard)</span>
              </div>
              <div className="summary-row summary-total">
                <span className="summary-label">Tổng cộng</span>
                <span className="summary-value">{selectedPlan.price.toLocaleString()}đ</span>
              </div>
              <button 
                className="pay-btn" 
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? '⏳ Đang xử lý...' : '💰 Thanh toán ngay'}
              </button>
              <p style={{ fontSize: 12, color: '#8B7355', textAlign: 'center', marginTop: 16 }}>
                🔒 Thanh toán an toàn qua VNPay. Hỗ trợ thẻ ATM nội địa, Visa, Mastercard.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner" />
            <div>Đang xác nhận thanh toán...</div>
          </div>
        </div>
      )}
    </>
  )
}