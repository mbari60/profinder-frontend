"use client";

import React from "react";
import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CartItem = React.memo(
  ({ item, updateQuantity, removeFromCart, processingAction }) => {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-3 flex gap-4">
          <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ShoppingBag className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="flex-grow">
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-muted-foreground text-sm">
              Ksh.{parseFloat(item.price)}
            </p>

            <div className="flex items-center mt-2">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 p-0"
                onClick={() => updateQuantity(item.id, -1)}
                disabled={processingAction}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="mx-2 w-8 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 p-0"
                onClick={() => updateQuantity(item.id, 1)}
                disabled={processingAction}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 text-destructive"
            onClick={() => removeFromCart(item.id)}
            disabled={processingAction}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    );
  }
);

CartItem.displayName = "CartItem";

export default CartItem;
