from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import CartSerializer
from .services import CartService


class CartDetailView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return CartService.get_or_create_cart(self.request.user)


class AddToCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            cart = CartService.add_item(
                user=request.user,
                product_id=request.data.get('product_id'),
                quantity=int(request.data.get('quantity', 1)),
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class UpdateCartItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, item_id):
        try:
            quantity = int(request.data.get('quantity'))
            cart = CartService.update_item_quantity(request.user, item_id, quantity)
        except LookupError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if cart is None:
            return Response({"message": "Item removed."}, status=status.HTTP_200_OK)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class RemoveCartItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, item_id):
        try:
            CartService.remove_item(request.user, item_id)
        except LookupError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

        return Response({"message": "Item removed."}, status=status.HTTP_200_OK)