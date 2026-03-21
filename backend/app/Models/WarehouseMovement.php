<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WarehouseMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',
        'movement_type',
        'quantity',
        'quantity_before',
        'quantity_after',
        'warehouse_location_id',
        'warehouse_location_to_id',
        'reference_type',
        'reference_id',
        'notes',
        'performed_by',
        'status',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
        'quantity_before' => 'decimal:3',
        'quantity_after' => 'decimal:3',
    ];

    // Tipos de movimiento
    const TYPE_INCOME = 'income';
    const TYPE_EXPENSE = 'expense';
    const TYPE_ADJUSTMENT = 'adjustment';
    const TYPE_TRANSFER = 'transfer';

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function warehouseLocation()
    {
        return $this->belongsTo(WarehouseLocation::class, 'warehouse_location_id');
    }

    public function warehouseLocationTo()
    {
        return $this->belongsTo(WarehouseLocation::class, 'warehouse_location_to_id');
    }

    /**
     * Registrar un movimiento de almacén y actualizar el stock
     */
    public static function register(array $data): self
    {
        $inventoryItem = InventoryItem::findOrFail($data['inventory_item_id']);
        
        $quantityBefore = $inventoryItem->quantity;
        
        // Calcular la nueva cantidad según el tipo de movimiento
        $quantity = $data['quantity'];
        switch ($data['movement_type']) {
            case self::TYPE_INCOME:
                $quantityAfter = $quantityBefore + $quantity;
                break;
            case self::TYPE_EXPENSE:
                $quantityAfter = $quantityBefore - $quantity;
                break;
            case self::TYPE_ADJUSTMENT:
                $quantityAfter = $quantity; //直接设置为指定数量
                break;
            case self::TYPE_TRANSFER:
                $quantityAfter = $quantityBefore - $quantity; // Se reduce de origen
                break;
            default:
                $quantityAfter = $quantityBefore;
        }

        // Crear el movimiento
        $movement = self::create([
            'inventory_item_id' => $data['inventory_item_id'],
            'movement_type' => $data['movement_type'],
            'quantity' => $quantity,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $quantityAfter,
            'warehouse_location_id' => $data['warehouse_location_id'] ?? null,
            'warehouse_location_to_id' => $data['warehouse_location_to_id'] ?? null,
            'reference_type' => $data['reference_type'] ?? null,
            'reference_id' => $data['reference_id'] ?? null,
            'notes' => $data['notes'] ?? null,
            'performed_by' => $data['performed_by'] ?? null,
            'status' => $data['status'] ?? 'completed',
        ]);

        // Actualizar el stock del inventario
        $inventoryItem->update([
            'quantity' => $quantityAfter,
            'last_movement' => now(),
        ]);

        // Sincronizar stock con Products o Materials por código
        self::syncStockByCode($inventoryItem->code, $quantity, $data['movement_type']);

        // Si es transferencia, crear movimiento de ingreso en destino
        if ($data['movement_type'] === self::TYPE_TRANSFER && !empty($data['warehouse_location_to_id'])) {
            self::create([
                'inventory_item_id' => $data['inventory_item_id'],
                'movement_type' => self::TYPE_INCOME,
                'quantity' => $quantity,
                'quantity_before' => 0, // Se obtendrá el stock actual en el destino
                'quantity_after' => 0, // Se actualizará después
                'warehouse_location_id' => $data['warehouse_location_to_id'],
                'warehouse_location_to_id' => null,
                'reference_type' => $data['reference_type'] ?? null,
                'reference_id' => $data['reference_id'] ?? null,
                'notes' => 'Transferencia desde ubicación: ' . ($data['warehouse_location_id'] ?? 'N/A'),
                'performed_by' => $data['performed_by'] ?? null,
                'status' => 'completed',
            ]);
        }

        return $movement;
    }

    /**
     * Sincronizar stock con Products o Materials basado en el código
     * Busca primero en products, luego en materials
     */
    private static function syncStockByCode(string $code, float $quantity, string $movementType): void
    {
        // Buscar en products por código
        $product = Product::where('code', $code)->first();
        if ($product) {
            if ($movementType === self::TYPE_INCOME) {
                $product->increment('stock', $quantity);
            } elseif ($movementType === self::TYPE_EXPENSE) {
                $product->decrement('stock', $quantity);
            }
            return;
        }

        // Buscar en materials por código
        $material = Material::where('code', $code)->first();
        if ($material) {
            if ($movementType === self::TYPE_INCOME) {
                $material->increment('stock', $quantity);
            } elseif ($movementType === self::TYPE_EXPENSE) {
                $material->decrement('stock', $quantity);
            }
        }
    }

    /**
     * Sincronizar todo el inventario con products y materials
     * Útil para inicializar o corregir datos
     */
    public static function syncAllStock(): array
    {
        $inventoryItems = InventoryItem::all();
        $synced = ['products' => 0, 'materials' => 0, 'not_found' => 0];

        foreach ($inventoryItems as $item) {
            // Buscar en products
            $product = Product::where('code', $item->code)->first();
            if ($product) {
                // Actualizar stock del product con la cantidad actual del inventario
                $product->update(['stock' => $item->quantity]);
                $synced['products']++;
                continue;
            }

            // Buscar en materials
            $material = Material::where('code', $item->code)->first();
            if ($material) {
                // Actualizar stock del material con la cantidad actual del inventario
                $material->update(['stock' => $item->quantity]);
                $synced['materials']++;
                continue;
            }

            $synced['not_found']++;
        }

        return $synced;
    }

    /**
     * Obtener movimientos por tipo
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('movement_type', $type);
    }

    /**
     * Obtener movimientos por item de inventario
     */
    public function scopeByInventoryItem($query, int $inventoryItemId)
    {
        return $query->where('inventory_item_id', $inventoryItemId);
    }
}
