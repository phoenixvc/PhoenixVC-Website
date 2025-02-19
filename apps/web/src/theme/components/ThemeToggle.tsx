import { Moon, Sun, Palette } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { useTheme } from '@/theme'
import { ColorScheme } from '@/theme/types'

const ThemeToggle = () => {
  const {
    mode,
    colorScheme,
    useSystemMode,
    setMode,
    setColorScheme,
    setUseSystemMode
  } = useTheme()

  const colorSchemes: { label: string; value: ColorScheme }[] = [
    { label: 'Classic', value: 'classic' },
    { label: 'Forest', value: 'forest' },
    { label: 'Ocean', value: 'ocean' },
    { label: 'Sunset', value: 'phoenix' },
    { label: 'Lavender', value: 'lavender' }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setMode('light')}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuCheckboxItem
          checked={useSystemMode}
          onCheckedChange={setUseSystemMode}
        >
          Use system
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            Color Scheme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {colorSchemes.map((scheme) => (
              <DropdownMenuItem
                key={scheme.value}
                onClick={() => setColorScheme(scheme.value)}
                className="flex items-center"
              >
                <div
                  className={`w-4 h-4 rounded-full mr-2 border ${
                    colorScheme === scheme.value ? 'border-primary' : 'border-muted'
                  }`}
                />
                {scheme.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThemeToggle
