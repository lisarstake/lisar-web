import React from "react";
import { TrendingUp, TrendingDown, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface SummaryCardProps {
  value: string;
  label: string;
  change: string;
  isPositive: boolean;
  trend: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  value,
  label,
  change,
  isPositive,
  trend,
}) => {
  // Simple sparkline simulation with a small line
  const Sparkline = () => (
    <div className="h-10 w-20 flex items-end justify-between">
      {[20, 35, 30, 45, 40, 50].map((height, idx) => (
        <div
          key={idx}
          className={`w-2 rounded-t ${
            isPositive ? "bg-green-500" : "bg-red-500"
          }`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );

  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            <p className="text-sm text-gray-600 mb-3">{label}</p>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium flex items-center gap-1 ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {change}
              </span>
              <span className="text-xs text-gray-500">{trend}</span>
            </div>
          </div>
          <div className="ml-4">
            <Sparkline />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const topProducts = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=100",
    name: "Denim Jacket",
    category: "Men's Tops",
    stock: "In Stock",
    totalSales: "1.43k",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100",
    name: "Nike Air Max 97",
    category: "Men's Shoes",
    stock: "Out of Stock",
    totalSales: "2.68k",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100",
    name: "Jordan Air",
    category: "Men's T-Shirt",
    stock: "In Stock",
    totalSales: "1.43k",
  },
];

const topCustomers = [
  {
    id: 1,
    name: "Robert Lewis",
    purchases: 26,
    totalSpent: "$4.19K",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
  },
  {
    id: 2,
    name: "Tom Barrett",
    purchases: 21,
    totalSpent: "$3.56K",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tom",
  },
  {
    id: 3,
    name: "Jenson Doyle",
    purchases: 17,
    totalSpent: "$3.12K",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jenson",
  },
  {
    id: 4,
    name: "Donald Cortez",
    purchases: 15,
    totalSpent: "$2.14K",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Donald",
  },
];

const recentOrders = [
  {
    id: 1,
    productName: "Nike Air Force 1",
    category: "Shoes",
    price: "$110.96",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100",
  },
  {
    id: 2,
    productName: "Men's Dri-FIT 7",
    category: "Sports",
    price: "$38.97",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100",
  },
  {
    id: 3,
    productName: "Jordan Dri-FIT Sport",
    category: "Sports",
    price: "$35.50",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100",
  },
];

export const OverviewPage: React.FC = () => {
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <SummaryCard
          value="307.48K"
          label="Total Customer"
          change="+30%"
          isPositive={true}
          trend="This month"
        />
        <SummaryCard
          value="$30.58K"
          label="Total Revenue"
          change="-15%"
          isPositive={false}
          trend="This month"
        />
        <SummaryCard
          value="2.48K"
          label="Total Deals"
          change="+23%"
          isPositive={true}
          trend="This month"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
        {/* Left Side - Table */}
        <div className="w-full lg:col-span-8">
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Top selling products
            </h2>
          </div>

          <Card className="bg-white overflow-hidden py-0">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          S/NO
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product Name
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          Category
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sales
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topProducts.map((product, idx) => (
                        <tr
                          key={product.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            {String(idx + 1).padStart(2, "0")}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                              />
                              <div>
                                <span className="text-xs sm:text-sm font-medium text-gray-900 block">
                                  {product.name}
                                </span>
                                <span className="text-xs text-gray-500 sm:hidden">
                                  {product.category}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                            {product.category}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={
                                product.stock === "In Stock"
                                  ? "default"
                                  : "destructive"
                              }
                              className={
                                product.stock === "In Stock"
                                  ? "bg-green-100 text-green-800 border-0 text-xs"
                                  : "bg-red-100 text-red-800 border-0 text-xs"
                              }
                            >
                              {product.stock === "In Stock" ? (
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                              ) : (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              <span className="hidden sm:inline">{product.stock}</span>
                              <span className="sm:hidden">
                                {product.stock === "In Stock" ? "In" : "Out"}
                              </span>
                            </Badge>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            {product.totalSales}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:col-span-4 space-y-4 lg:space-y-6">
          {/* Top Customers */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Top Customers</h3>
                <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium">
                  See all
                </button>
              </div>

          <Card className="bg-white py-2">
            <CardContent className="px-4">
              <div className="space-y-4">
                {topCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={customer.avatar} />
                        <AvatarFallback>
                          {customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </p>
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        </div>
                        <p className="text-xs text-gray-500">
                          {customer.purchases} Purchase
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {customer.totalSpent}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
