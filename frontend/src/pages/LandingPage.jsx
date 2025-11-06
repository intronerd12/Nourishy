import React from 'react'
import { Link } from 'react-router-dom'
import MetaData from '../Components/Layout/MetaData'
import GuestRedirect from '../Components/Route/GuestRedirect'

const LandingPage = () => {
  // Sample products for showcase
  const featuredProducts = [
    {
      id: 1,
      name: 'Hydrating Shampoo',
      category: 'Shampoo',
      price: 24.99,
      rating: 4.8,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
      description: 'Deep moisture formula for dry, damaged hair with botanical extracts',
      benefits: ['Sulfate-free', 'Paraben-free', 'Vegan'],
      featured: true
    },
    {
      id: 4,
      name: 'Nourishing Hair Oil',
      category: 'Treatment',
      price: 32.99,
      rating: 5.0,
      reviews: 278,
      image: 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400&h=400&fit=crop',
      description: 'Luxurious blend of argan and jojoba oils for ultimate shine',
      benefits: ['Shine-boosting', 'Heat protection', 'Natural ingredients'],
      featured: true
    },
    {
      id: 6,
      name: 'Scalp Treatment Serum',
      category: 'Treatment',
      price: 38.99,
      rating: 4.9,
      reviews: 203,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
      description: 'Promotes healthy scalp and hair growth with biotin',
      benefits: ['Biotin-infused', 'Dermatologist tested', 'Fast-absorbing'],
      featured: true
    },
    {
      id: 8,
      name: 'Deep Conditioning Mask',
      category: 'Treatment',
      price: 34.99,
      rating: 5.0,
      reviews: 312,
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
      description: 'Weekly intensive moisture treatment with keratin',
      benefits: ['Keratin-enriched', 'Restores elasticity', 'Salon-quality']
    }
  ];

  const categories = ['Shampoo', 'Conditioner', 'Hair Oil', 'Hair Mask', 'Hair Serum', 'Hair Spray'];

  return (
    <>
      <MetaData title={'Professional Hair Care'} />
      <div className="min-h-screen bg-white">
        {/* Top Banner */}
        <div className="bg-emerald-900 text-white text-center py-2 text-sm">
          Free shipping on orders over ₱2,500 • 30-day money-back guarantee
        </div>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-50 to-emerald-50 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200 rounded-full blur-3xl"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-6">
                  Naturally Nourishing Since 2020
                </div>
                <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                  Premium Hair Care,<br />
                  <span className="text-emerald-600">Naturally Crafted</span>
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Professional-grade formulas infused with botanical ingredients to transform your hair care routine.
                </p>
                <div className="flex flex-wrap gap-4">
                  <GuestRedirect to="/products" className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center space-x-2">
                    <span>Shop Collection</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </GuestRedirect>
                  <Link to="/about" className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-lg font-semibold hover:border-emerald-600 hover:text-emerald-600 transition">
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <img src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=300&h=400&fit=crop" alt="Product" className="rounded-2xl shadow-xl w-full h-64 object-cover" />
                  <img src="https://images.unsplash.com/photo-1571875257727-256c39da42af?w=300&h=400&fit=crop" alt="Product" className="rounded-2xl shadow-xl w-full h-64 object-cover mt-8" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-y border-gray-200 bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Natural Ingredients</h3>
                <p className="text-sm text-gray-600">Plant-based formulas</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Free Shipping</h3>
                <p className="text-sm text-gray-600">On orders over ₱2,500</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Guaranteed Quality</h3>
                <p className="text-sm text-gray-600">30-day returns</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Gift Ready</h3>
                <p className="text-sm text-gray-600">Premium packaging</p>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Products</h2>
            <p className="text-gray-600">Discover our collection of professional hair care solutions</p>
          </div>

          <div className="flex overflow-x-auto pb-4 mb-8 gap-4">
            {categories.map((cat, index) => (
              <Link 
                key={index} 
                to={`/products?category=${cat}`} 
                className="px-6 py-3 rounded-lg whitespace-nowrap font-medium transition bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200"
              >
                {cat}
              </Link>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                <div className="relative h-72 overflow-hidden bg-gray-100">
                  {product.featured && <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">Featured</div>}
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                    <span className="text-white text-sm font-medium">{product.category}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-semibold text-slate-900">{product.rating}</span>
                    <span className="ml-1 text-sm text-gray-500">({product.reviews})</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {product.benefits.slice(0, 2).map((benefit, index) => (
                      <span key={index} className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-medium">{benefit}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-2xl font-bold text-slate-900">₱{product.price}</span>
                    </div>
                    <GuestRedirect to={`/product/${product.id}`} className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition flex items-center space-x-2 font-semibold">
                      <span>View Details</span>
                    </GuestRedirect>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <GuestRedirect to="/products" className="inline-flex items-center justify-center px-8 py-4 border-2 border-emerald-600 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-600 hover:text-white transition">
              View All Products
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </GuestRedirect>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-emerald-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">What Our Customers Say</h2>
              <p className="text-gray-600">Real results from real people</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6">"The Hydrating Shampoo completely transformed my dry, damaged hair. After just one use, my hair felt softer and looked healthier than it has in years!"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xl">S</div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-slate-900">Sarah M.</h4>
                    <p className="text-sm text-gray-500">Verified Customer</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6">"I've tried countless hair oils, but the Nourishing Hair Oil from Nourishy is by far the best. It adds incredible shine without weighing my hair down or making it greasy."</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xl">J</div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-slate-900">James L.</h4>
                    <p className="text-sm text-gray-500">Verified Customer</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6">"The Deep Conditioning Mask is a game-changer for my curly hair. It defines my curls, eliminates frizz, and leaves my hair feeling incredibly soft and manageable."</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xl">A</div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-slate-900">Aisha K.</h4>
                    <p className="text-sm text-gray-500">Verified Customer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-emerald-600 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">Join Our Community</h2>
                <p className="text-emerald-100 mb-6">Subscribe to our newsletter for exclusive offers, hair care tips, and early access to new products.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input type="email" placeholder="Enter your email" className="px-4 py-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-white" />
                  <button className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition">
                    Subscribe
                  </button>
                </div>
              </div>
              <div className="hidden md:block">
                <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&h=300&fit=crop" alt="Hair care products" className="rounded-xl shadow-lg" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default LandingPage