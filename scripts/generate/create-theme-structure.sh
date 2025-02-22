#!/bin/bash

# Base directory
BASE_DIR=".apps/web/src/theme/types/theme"

# Create main directories
mkdir -p "$BASE_DIR"/{factories,strategies,builders,interfaces,core}

# Create factory directories
mkdir -p "$BASE_DIR/factories"/{interactive,container,feedback}
mkdir -p "$BASE_DIR/factories/base"

# Create strategy directories
mkdir -p "$BASE_DIR/strategies"/{interactive,container,feedback}
mkdir -p "$BASE_DIR/strategies/base"

# Create builder directories
mkdir -p "$BASE_DIR/builders"/{interactive,container,feedback}
mkdir -p "$BASE_DIR/builders/base"

# Create factory files
cat > "$BASE_DIR/factories/base/ComponentVariantFactory.ts" << EOF
// TODO: Implement base component variant factory
export abstract class ComponentVariantFactory {
    // Base factory implementation
}
EOF

# Interactive factories
cat > "$BASE_DIR/factories/interactive/ButtonFactory.ts" << EOF
// TODO: Implement button variant factory
EOF

cat > "$BASE_DIR/factories/interactive/InputFactory.ts" << EOF
// TODO: Implement input variant factory
EOF

cat > "$BASE_DIR/factories/interactive/SelectFactory.ts" << EOF
// TODO: Implement select variant factory
EOF

# Container factories
cat > "$BASE_DIR/factories/container/CardFactory.ts" << EOF
// TODO: Implement card variant factory
EOF

cat > "$BASE_DIR/factories/container/ModalFactory.ts" << EOF
// TODO: Implement modal variant factory
EOF

cat > "$BASE_DIR/factories/container/MenuFactory.ts" << EOF
// TODO: Implement menu variant factory
EOF

# Feedback factories
cat > "$BASE_DIR/factories/feedback/ToastFactory.ts" << EOF
// TODO: Implement toast variant factory
EOF

cat > "$BASE_DIR/factories/feedback/BadgeFactory.ts" << EOF
// TODO: Implement badge variant factory
EOF

cat > "$BASE_DIR/factories/feedback/TooltipFactory.ts" << EOF
// TODO: Implement tooltip variant factory
EOF

# Create strategy files
cat > "$BASE_DIR/strategies/base/ComponentStateStrategy.ts" << EOF
// TODO: Implement base component state strategy
export abstract class ComponentStateStrategy {
    // Base strategy implementation
}
EOF

# Interactive strategies
cat > "$BASE_DIR/strategies/interactive/ClickableStrategy.ts" << EOF
// TODO: Implement clickable state strategy
EOF

cat > "$BASE_DIR/strategies/interactive/InputStateStrategy.ts" << EOF
// TODO: Implement input state strategy
EOF

cat > "$BASE_DIR/strategies/interactive/ToggleStateStrategy.ts" << EOF
// TODO: Implement toggle state strategy
EOF

# Container strategies
cat > "$BASE_DIR/strategies/container/OverlayStrategy.ts" << EOF
// TODO: Implement overlay state strategy
EOF

cat > "$BASE_DIR/strategies/container/ContentStrategy.ts" << EOF
// TODO: Implement content state strategy
EOF

# Feedback strategies
cat > "$BASE_DIR/strategies/feedback/NotificationStrategy.ts" << EOF
// TODO: Implement notification state strategy
EOF

cat > "$BASE_DIR/strategies/feedback/IndicatorStrategy.ts" << EOF
// TODO: Implement indicator state strategy
EOF

# Create builder files
cat > "$BASE_DIR/builders/base/VariantBuilder.ts" << EOF
// TODO: Implement base variant builder
export abstract class VariantBuilder {
    // Base builder implementation
}
EOF

# Interactive builders
cat > "$BASE_DIR/builders/interactive/ButtonVariantBuilder.ts" << EOF
// TODO: Implement button variant builder
EOF

cat > "$BASE_DIR/builders/interactive/InputVariantBuilder.ts" << EOF
// TODO: Implement input variant builder
EOF

# Container builders
cat > "$BASE_DIR/builders/container/CardVariantBuilder.ts" << EOF
// TODO: Implement card variant builder
EOF

cat > "$BASE_DIR/builders/container/ModalVariantBuilder.ts" << EOF
// TODO: Implement modal variant builder
EOF

# Feedback builders
cat > "$BASE_DIR/builders/feedback/ToastVariantBuilder.ts" << EOF
// TODO: Implement toast variant builder
EOF

cat > "$BASE_DIR/builders/feedback/BadgeVariantBuilder.ts" << EOF
// TODO: Implement badge variant builder
EOF

# Create composite factory
cat > "$BASE_DIR/factories/CompositeVariantFactory.ts" << EOF
// TODO: Implement composite variant factory
export class CompositeVariantFactory {
    // Composite factory implementation
}
EOF

# Create main interfaces file
cat > "$BASE_DIR/interfaces/index.ts" << EOF
// TODO: Export all component variant interfaces
export interface ComponentVariants {
    // Component variant interfaces
}
EOF

echo "Folder structure and stub files created successfully!"
