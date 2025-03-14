"use client";

import React from "react";
import { Plus, Eye, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ProductCard = React.memo(
  ({ product, openProductDetails, addToCart, processingAction }) => {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div
          className="h-48 bg-muted relative cursor-pointer"
          onClick={() => openProductDetails(product)}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-12 w-12" />
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="text-lg font-medium truncate">{product.name}</h3>
          <p className="text-muted-foreground text-sm mt-1 h-12 overflow-hidden">
            {product.description}
          </p>

          <div className="mt-4 flex justify-between items-center">
            <span className="text-primary font-bold">
              Ksh.{parseFloat(product.price)}
            </span>
            {product.size && <Badge variant="outline">{product.size}</Badge>}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                openProductDetails(product);
              }}
              className="w-full"
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              Details
            </Button>
            <Button
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              disabled={processingAction}
            >
              <Plus className="h-3 w-3 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
