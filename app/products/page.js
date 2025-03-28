"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ShoppingCart,
  Search,
  Filter,
  X,
  Plus,
  Minus,
  ShoppingBag,
  Star,
  Send,
  Trash2,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../utils/api";

// Import shadcn UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Import reusable components
import StarRating from "@/recurent/StarRating";
import ProductCard from "@/others/ProductCard";
import CartItem from "@/others/CartItem";
import ReviewCard from "@/others/ReviewCard";

const ProductPage = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeProduct, setActiveProduct] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    reviewer_name: "",
    product: null,
  });

  // Checkout form state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    customer_name: "",
    email: "",
    phone_number: "",
    delivery_address: "",
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Refs for cleanup
  const cartTimeoutRef = useRef(null);
  const abortControllerRef = useRef(new AbortController());

  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const category = selectedCategory;
    
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);

      const matchesCategory =
        category === "all" || product.product_category === parseInt(category);

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Memoized cart total
  const cartTotal = useMemo(() => {
    return cart.reduce(
      (total, item) => total + parseFloat(item.price) * item.quantity,
      0
    ).toFixed(2);
  }, [cart]);

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      abortControllerRef.current = new AbortController();
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get("/api/products/", { signal: abortControllerRef.current.signal }),
          api.get("/api/product-categories/", { signal: abortControllerRef.current.signal }),
        ]);

        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Failed to fetch data", error);
          toast.error("Failed to load products");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart data", e);
        localStorage.removeItem("cart");
      }
    }

    return () => {
      abortControllerRef.current.abort();
    };
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Fetch product reviews when activeProduct changes
  useEffect(() => {
    if (!activeProduct) return;

    const fetchReviews = async () => {
      setLoadingReviews(true);
      abortControllerRef.current = new AbortController();
      try {
        const response = await api.get(
          `/api/reviews/?product=${activeProduct.id}&limit=5`,
          { signal: abortControllerRef.current.signal }
        );
        setReviews(response.data);
        setReviewForm((prev) => ({ ...prev, product: activeProduct.id }));
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Failed to fetch reviews", error);
        }
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
    return () => {
      abortControllerRef.current.abort();
    };
  }, [activeProduct]);

  // Close cart automatically after 3 seconds when empty
  useEffect(() => {
    if (cartOpen && cart.length === 0) {
      cartTimeoutRef.current = setTimeout(() => {
        setCartOpen(false);
      }, 3000);
    }

    return () => {
      if (cartTimeoutRef.current) {
        clearTimeout(cartTimeoutRef.current);
      }
    };
  }, [cartOpen, cart.length]);

  // Cart handlers
  const addToCart = useCallback((product) => {
    if (processingAction) return;
    setProcessingAction(true);

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      return existingItem
        ? prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prevCart, { ...product, quantity: 1 }];
    });

    toast.success("Added to cart!");
    setProcessingAction(false);
  }, [processingAction]);

  const updateQuantity = useCallback((id, amount) => {
    if (processingAction) return;
    setProcessingAction(true);

    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + amount;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean)
    );

    setProcessingAction(false);
  }, [processingAction]);

  const removeFromCart = useCallback((id) => {
    if (processingAction) return;
    setProcessingAction(true);

    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    toast.success("Item removed from cart");
    setProcessingAction(false);
  }, [processingAction]);

  // Product details handler
  const openProductDetails = useCallback((product) => {
    setActiveProduct(product);
    setProductModalOpen(true);
  }, []);

  // Review handlers
  const handleReviewChange = useCallback((e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const submitReview = useCallback(async () => {
    if (isSubmittingReview) return;

    if (!reviewForm.comment || !reviewForm.reviewer_name) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await api.post("/api/reviews/", reviewForm);
      setReviews((prev) => [response.data, ...prev.slice(0, 4)]);
      setReviewForm({
        rating: 5,
        comment: "",
        reviewer_name: "",
        product: activeProduct.id,
      });
      toast.success("Review submitted successfully");
    } catch (error) {
      console.error("Failed to submit review", error);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  }, [activeProduct, isSubmittingReview, reviewForm]);

  // Checkout handlers
  const validatePhoneNumber = useCallback((phone) => {
    const kenyanPhoneRegex = /^\+254[17]\d{8}$/;
    return kenyanPhoneRegex.test(phone);
  }, []);

  const handleCheckoutChange = useCallback((e) => {
    const { name, value } = e.target;
    setCheckoutForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleCheckout = useCallback(async () => {
    if (!checkoutForm.customer_name || !checkoutForm.phone_number || !checkoutForm.delivery_address) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!validatePhoneNumber(checkoutForm.phone_number)) {
      toast.error("Please enter a valid Kenyan phone number (format: +254 followed by 7 or 1 and 8 digits)");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderData = {
        customer_name: checkoutForm.customer_name,
        email: checkoutForm.email || "",
        phone_number: checkoutForm.phone_number,
        delivery_address: checkoutForm.delivery_address,
        products: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      };

      await api.post("/api/orders/", orderData);
      setCart([]);
      localStorage.removeItem("cart");
      setCheckoutModalOpen(false);
      toast.success("Order placed successfully!");
      setCheckoutForm({
        customer_name: "",
        email: "",
        phone_number: "",
        delivery_address: "",
      });
    } catch (error) {
      console.error("Failed to place order", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  }, [cart, checkoutForm, validatePhoneNumber]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with search and cart */}
      <header className="bg-card/95 backdrop-blur-sm sticky top-12 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-1xl font-bold">Gravien Shop</h1>

          <div className="flex space-x-4 items-center">
            <div className="relative hidden md:block w-64">
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            </div>

            <Button
              variant="outline"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(!cartOpen)}
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 px-1 min-w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile search bar */}
      <div className="container mx-auto px-4 py-3 md:hidden">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        </div>
      </div>

      {/* Sticky Filter Section */}
      <div className="sticky top-[calc(3.5rem+1px)] z-10 bg-background/95 backdrop-blur-sm mb-8">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Card className="w-full md:w-auto">
            <CardContent className="p-4 flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Filter by category:</span>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Badge variant="outline" className="py-2 px-4">
            Showing {filteredProducts.length} of {products.length} products
          </Badge>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 pb-8">
        {/* Product grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No products found. Try changing your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                openProductDetails={openProductDetails}
                addToCart={addToCart}
                processingAction={processingAction}
              />
            ))}
          </div>
        )}
      </main>

      {/* Cart sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-96 bg-background border-l transform ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-20 shadow-lg`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCartOpen(false)}
                className="text-primary"
                aria-label="Continue Shopping"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-bold text-foreground">Your Cart</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCartOpen(false)}
            >
              <X className="h-5 w-5 text-foreground" />
            </Button>
          </div>

          <div className="flex-grow overflow-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <ShoppingCart className="h-16 w-16 mb-4" />
                <p className="text-foreground">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                    processingAction={processingAction}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-background/95 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-foreground">Total:</span>
              <span className="text-xl font-bold text-primary">
                Ksh.{cartTotal}
              </span>
            </div>

            <Button
              className="w-full"
              disabled={cart.length === 0 || isPlacingOrder}
              onClick={() => setCheckoutModalOpen(true)}
            >
              {isPlacingOrder ? "Processing..." : "Checkout"}
            </Button>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          {activeProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {activeProduct.name}
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="details" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="pt-4">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/2 h-64 md:h-80 bg-muted rounded-lg overflow-hidden">
                      {activeProduct.image ? (
                        <img
                          src={activeProduct.image}
                          alt={activeProduct.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ShoppingBag className="h-24 w-24" />
                        </div>
                      )}
                    </div>

                    <div className="w-full md:w-1/2">
                      <div className="space-y-4">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            Ksh.{parseFloat(activeProduct.price).toFixed(2)}
                          </p>
                        </div>

                        {activeProduct.size && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                              Size
                            </h4>
                            <p>{activeProduct.size}</p>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Description
                          </h4>
                          <p className="mt-1">{activeProduct.description}</p>
                        </div>

                        <Button
                          className="w-full mt-6"
                          onClick={() => addToCart(activeProduct)}
                          disabled={processingAction}
                        >
                          Add to Cart
                        </Button>

                        {activeProduct.instagram_link && (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                              window.open(
                                activeProduct.instagram_link,
                                "_blank"
                              )
                            }
                          >
                            View on Instagram
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="pt-4 space-y-6">
                  {/* Review form */}
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">
                        Write a Review
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Rating
                          </label>
                          <StarRating
                            rating={reviewForm.rating}
                            size={6}
                            interactive={true}
                            onChange={(rating) =>
                              setReviewForm((prev) => ({ ...prev, rating }))
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Your Name
                          </label>
                          <Input
                            name="reviewer_name"
                            value={reviewForm.reviewer_name}
                            onChange={handleReviewChange}
                            placeholder="Enter your name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Review
                          </label>
                          <Textarea
                            name="comment"
                            value={reviewForm.comment}
                            onChange={handleReviewChange}
                            placeholder="Write your review here..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button
                        onClick={submitReview}
                        disabled={isSubmittingReview}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Reviews list */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Latest Reviews ({reviews.length})
                    </h3>

                    {loadingReviews ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : reviews.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">
                        No reviews yet. Be the first to review!
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      <Dialog open={checkoutModalOpen} onOpenChange={setCheckoutModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Complete your order by providing your delivery information.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="customer_name"
                value={checkoutForm.customer_name}
                onChange={handleCheckoutChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                name="email"
                value={checkoutForm.email}
                onChange={handleCheckoutChange}
                placeholder="Enter your email"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                name="phone_number"
                value={checkoutForm.phone_number}
                onChange={handleCheckoutChange}
                placeholder="+254XXXXXXXXX (Kenyan format)"
                required
              />
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Delivery Address <span className="text-red-500">*</span>
              </label>
              <Textarea
                name="delivery_address"
                value={checkoutForm.delivery_address}
                onChange={handleCheckoutChange}
                placeholder="Enter your complete delivery address"
                rows={3}
                required
              />
            </div>

            {/* Order Summary */}
            <div className="mt-6">
              <h3 className="font-medium mb-2">Order Summary</h3>
              <div className="border rounded-md divide-y">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.quantity} ×</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span>Ksh.{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <div className="p-3 flex justify-between items-center bg-muted/50">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary">
                    Ksh.{cartTotal}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setCheckoutModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCheckout} disabled={isPlacingOrder}>
              {isPlacingOrder ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Overlay when cart is open on mobile */}
      {cartOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-10"
          onClick={() => setCartOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default ProductPage;
