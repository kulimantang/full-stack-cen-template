// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0

package postgresql

import (
	"github.com/google/uuid"
)

type Item struct {
	ID          uuid.UUID
	Title       string
	Description *string
	OwnerID     uuid.UUID
}