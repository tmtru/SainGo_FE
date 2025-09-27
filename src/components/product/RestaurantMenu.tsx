"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Search } from "lucide-react"
import type { Product } from "@/data/Services/ProductService"
import type { Category } from "@/data/Services/CategoryService"

interface RestaurantMenuWithApiProps {
  products: Product[]
  categories: Category[]
  loading: boolean
  error: string | null
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategories: string[]
  onCategoryChange: (categoryId: string) => void
}

const nutritionCategories = [
  { id: "all", label: "Tất cả món", icon: "🍽️", description: "Toàn bộ thực đơn dinh dưỡng" },
  { id: "weight-gain", label: "Tăng cân", icon: "💪", description: "Giàu protein và calories tự nhiên" },
  { id: "weight-loss", label: "Giảm cân", icon: "🥗", description: "Ít calories, nhiều chất xơ" },
  { id: "maintenance", label: "Duy trì", icon: "⚖️", description: "Cân bằng dinh dưỡng hoàn hảo" },
  { id: "heart-healthy", label: "Tim mạch", icon: "❤️", description: "Ít muối, giàu omega-3" },
  { id: "diabetes", label: "Tiểu đường", icon: "🩺", description: "Chỉ số đường huyết thấp" },
  { id: "blood-pressure", label: "Huyết áp", icon: "🌿", description: "Ít natri, giàu kali và magie" },
]

export function RestaurantMenuWithApi({
  products,
  categories,
  loading,
  error,
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoryChange,
}: RestaurantMenuWithApiProps) {
  const [activeFilter, setActiveFilter] = useState("all")
  const [localSearchTerm, setLocalSearchTerm] = useState(searchQuery)

  useEffect(() => {
    setLocalSearchTerm(searchQuery)
  }, [searchQuery])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchChange(localSearchTerm)
  }

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId)
    if (filterId === "all") {
      // Clear all category selections
      selectedCategories.forEach((catId) => onCategoryChange(catId))
    } else {
      // Find matching category and select it
      const matchingCategory = categories.find(
        (cat) =>
          cat.name.toLowerCase().includes(filterId.replace("-", " ")) ||
          filterId.includes(cat.name.toLowerCase().replace(" ", "-")),
      )
      if (matchingCategory && !selectedCategories.includes(matchingCategory.id)) {
        onCategoryChange(matchingCategory.id)
      }
    }
  }

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? Number.parseFloat(price) : price
    return new Intl.NumberFormat("vi-VN").format(numPrice)
  }

  const getProductImage = (product: Product) => {
    return product.thumbnailUrl || `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(product.name)}`
  }

  const getProductCalories = (product: Product) => {
    // Estimate calories based on price range (this is just for demo)
    const price = product.salePrice || product.basePrice
    if (price < 100000) return "280-350 kcal"
    if (price < 200000) return "400-520 kcal"
    return "550-720 kcal"
  }

  const getProductProtein = (product: Product) => {
    // Estimate protein based on price range (this is just for demo)
    const price = product.salePrice || product.basePrice
    if (price < 100000) return "18-25g protein"
    if (price < 200000) return "28-38g protein"
    return "42-52g protein"
  }

  const groupProductsByCategory = () => {
    const grouped: { [key: string]: { category: Category; products: Product[] } } = {}

    products.forEach((product) => {
      const category = categories.find((cat) => cat.id === product.mainCategoryId)
      if (category) {
        if (!grouped[category.id]) {
          grouped[category.id] = { category, products: [] }
        }
        grouped[category.id].products.push(product)
      }
    })

    return Object.values(grouped)
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 bg-white">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Đang tải thực đơn...</h3>
          <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-8 bg-white">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">Có lỗi xảy ra</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  const groupedProducts = groupProductsByCategory()

  return (
    <div className="p-4 md:p-8 bg-white">
      <div className="text-center mb-8 md:mb-12 border-b-2 md:border-b-4 border-green-800 pb-6 md:pb-8">
        <h1 className="menu-title text-3xl md:text-5xl font-bold text-green-800 mb-2">THỰC ĐƠN DINH DƯỠNG</h1>
        <p className="text-green-600 text-base md:text-lg italic mb-4">~ Nutritional Menu ~</p>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm md:text-base px-4 md:px-0">
          Được chế biến bởi đội ngũ đầu bếp chuyên nghiệp và dinh dưỡng viên, mỗi món ăn được thiết kế riêng cho mục
          tiêu sức khỏe của bạn
        </p>
      </div>

      <div className="mb-6 md:mb-8">
        <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-4 w-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm món ăn..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border-green-300 focus:border-green-500 focus:ring-green-500 rounded-full text-sm md:text-base"
          />
        </form>
      </div>

      <div className="mb-8 md:mb-12">
        <h3 className="text-center text-lg md:text-xl font-semibold text-green-800 mb-4 md:mb-6">
          Lọc theo mục đích dinh dưỡng
        </h3>
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 px-2 md:px-0">
          {nutritionCategories.map((option) => (
            <Button
              key={option.id}
              variant={activeFilter === option.id ? "default" : "outline"}
              onClick={() => handleFilterChange(option.id)}
              className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-full transition-all text-xs md:text-sm ${
                activeFilter === option.id
                  ? "bg-green-700 hover:bg-green-800 text-white"
                  : "border-green-300 text-green-700 hover:bg-green-50"
              }`}
            >
              <span className="text-sm md:text-base">{option.icon}</span>
              <span className="font-medium">{option.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy món ăn</h3>
          <p className="text-gray-500">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</p>
        </div>
      ) : (
        <div className="space-y-8 md:space-y-12">
          {groupedProducts.map((group, groupIndex) => (
            <div key={group.category.id} className="mb-8 md:mb-12">
              <div className="flex items-start md:items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <span className="text-2xl md:text-3xl flex-shrink-0">
                  {nutritionCategories.find(
                    (cat) =>
                      group.category.name.toLowerCase().includes(cat.label.toLowerCase()) ||
                      cat.label.toLowerCase().includes(group.category.name.toLowerCase()),
                  )?.icon || "🍽️"}
                </span>
                <div>
                  <h2 className="menu-section-title text-xl md:text-2xl font-bold text-green-800">
                    {group.category.name.toUpperCase()}
                  </h2>
                  <p className="text-green-600 italic text-xs md:text-sm mt-1">
                    {nutritionCategories.find(
                      (cat) =>
                        group.category.name.toLowerCase().includes(cat.label.toLowerCase()) ||
                        cat.label.toLowerCase().includes(group.category.name.toLowerCase()),
                    )?.description || "Món ăn chất lượng cao"}
                  </p>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                {group.products.map((product) => (
                  <div key={product.id} className="border-b border-gray-200 pb-4 md:pb-6 last:border-b-0">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
                      <div className="w-full md:w-40 md:flex-shrink-0">
                        <div className="w-full h-48 md:w-40 md:h-32 rounded-lg overflow-hidden shadow-md">
                          <Image
                            src={getProductImage(product) || "/placeholder.svg"}
                            alt={product.name}
                            width={320}
                            height={192}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                          <h3 className="menu-item-name text-lg md:text-lg text-gray-800 font-semibold">
                            {product.name}
                          </h3>
                          <div className="hidden md:block menu-dots flex-1"></div>
                          <span className="menu-price text-xl md:text-lg font-bold text-green-700 self-start md:self-center">
                            {formatPrice(product.salePrice || product.basePrice)}đ
                          </span>
                        </div>
                        <p className="menu-description text-gray-600 text-sm leading-relaxed mb-3">
                          {product.description ||
                            "Món ăn được chế biến từ nguyên liệu tươi sạch, đảm bảo dinh dưỡng và hương vị tuyệt vời."}
                        </p>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            {getProductCalories(product)}
                          </Badge>
                          <Badge variant="outline" className="border-green-300 text-green-700 text-xs">
                            {getProductProtein(product)}
                          </Badge>
                          {product.stockQuantity > 0 ? (
                            <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">
                              Còn hàng
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-red-300 text-red-700 text-xs">
                              Hết hàng
                            </Badge>
                          )}
                          {product.isAvailable && (
                            <Badge variant="outline" className="border-green-300 text-green-700 text-xs">
                              Có sẵn
                            </Badge>
                          )}
                          {product.isFeatured && (
                            <Badge variant="default" className="bg-yellow-100 text-yellow-800 text-xs">
                              Nổi bật
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {groupIndex < groupedProducts.length - 1 && <Separator className="mt-6 md:mt-8 bg-green-200" />}
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-8 md:mt-12 pt-6 md:pt-8 border-t-2 border-green-800">
        <p className="text-green-800 font-semibold mb-2 text-sm md:text-base">
          🍃 Tất cả món ăn được chế biến từ nguyên liệu tươi sạch 🍃
        </p>
        <p className="text-gray-600 text-xs md:text-sm">Giá đã bao gồm VAT • Phục vụ từ 8:00 - 21:00 hàng ngày</p>
        <p className="text-green-600 text-xs md:text-sm mt-2 italic">"Sức khỏe là tài sản quý giá nhất"</p>
      </div>
    </div>
  )
}
