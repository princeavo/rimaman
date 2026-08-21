import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { DeliveryMethod, OrderPaymentMethod, OrderStatus, PaymentStatus } from '@prisma/client';

export class OrderItemInput {
  @IsUUID()
  productId!: string;

  @IsString()
  name!: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  weight!: string;

  @IsString()
  image!: string;
}

export class ShippingAddressInput {
  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsString()
  @MinLength(6)
  phone!: string;

  @IsEmail()
  email!: string;

  @IsString()
  address!: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsString()
  country!: string;

  @IsOptional()
  @IsString()
  additionalInfo?: string;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items!: OrderItemInput[];

  @IsInt()
  @Min(0)
  subtotal!: number;

  @IsInt()
  @Min(0)
  shippingCost!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  discount?: number;

  @IsInt()
  @Min(0)
  total!: number;

  @ValidateNested()
  @Type(() => ShippingAddressInput)
  shippingAddress!: ShippingAddressInput;

  @IsEnum(DeliveryMethod)
  deliveryMethod!: DeliveryMethod;

  @IsEnum(OrderPaymentMethod)
  paymentMethod!: OrderPaymentMethod;

  @IsOptional()
  @IsString()
  promoCode?: string;
}

export class UpdateOrderStatusDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  orderStatus?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}
