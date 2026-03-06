
create_table() {
  awslocal dynamodb create-table "$@" 2>/dev/null || true
}

create_table \
  --table-name OrderAuditLog \
  --attribute-definitions AttributeName=orderId,AttributeType=S AttributeName=timestamp,AttributeType=S \
  --key-schema AttributeName=orderId,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

create_table \
  --table-name ReservationAuditLog \
  --attribute-definitions AttributeName=orderId,AttributeType=S AttributeName=timestamp,AttributeType=S \
  --key-schema AttributeName=orderId,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

create_table \
  --table-name NotificationAuditLog \
  --attribute-definitions AttributeName=orderId,AttributeType=S AttributeName=timestamp,AttributeType=S \
  --key-schema AttributeName=orderId,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

create_table \
  --table-name OrderSummaries \
  --attribute-definitions AttributeName=orderId,AttributeType=S \
  --key-schema AttributeName=orderId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

create_table \
  --table-name UserNotifications \
  --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=timestamp,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
