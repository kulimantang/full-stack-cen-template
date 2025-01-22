// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0

package postgresql

import (
	"context"

	"github.com/google/uuid"
)

type Querier interface {
	CreateItem(ctx context.Context, db DBTX, arg CreateItemParams) (Item, error)
	DeleteItem(ctx context.Context, db DBTX, id uuid.UUID) error
	FindItem(ctx context.Context, db DBTX, id uuid.UUID) (Item, error)
	GetAllItems(ctx context.Context, db DBTX, arg GetAllItemsParams) ([]Item, error)
	UpdateItem(ctx context.Context, db DBTX, arg UpdateItemParams) (Item, error)
}

var _ Querier = (*Queries)(nil)
