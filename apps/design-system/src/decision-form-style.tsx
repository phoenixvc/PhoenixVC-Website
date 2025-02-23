import React from 'react.js'
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const DesignDecisionForm = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Phoenix VC Design Direction</h1>
        <p className="text-gray-600">Define the initial design direction for the website</p>
      </div>

      <div className="space-y-6">
        {/* Visual Style Selection */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">1. Select Primary Visual Style</Label>
          <RadioGroup defaultValue="balanced-modern" className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="balanced-modern" id="balanced" />
              <Label htmlFor="balanced">Balanced Modern</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dynamic-minimalism" id="dynamic" />
              <Label htmlFor="dynamic">Dynamic Minimalism</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="enterprise-elegance" id="enterprise" />
              <Label htmlFor="enterprise">Enterprise Elegance</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="subtle-minimalism" id="subtle" />
              <Label htmlFor="subtle">Subtle Minimalism</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Initial Content Structure */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">2. Initial Pages</Label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Home</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>About</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Portfolio</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Contact</span>
            </label>
          </div>
        </div>

        {/* Color Theme */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">3. Color Theme Preference</Label>
          <Select>
            <option value="light">Light Mode Primary</option>
            <option value="dark">Dark Mode Primary</option>
            <option value="system">System Preference</option>
          </Select>
        </div>

        {/* Content Priority */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">4. Content Priority</Label>
          <div className="space-y-2">
            <Label>Order of Importance (1-5)</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input type="number" placeholder="Visual Impact" min="1" max="5" />
              <Input type="number" placeholder="Information Density" min="1" max="5" />
              <Input type="number" placeholder="Interaction" min="1" max="5" />
              <Input type="number" placeholder="Navigation" min="1" max="5" />
              <Input type="number" placeholder="Animation" min="1" max="5" />
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">5. Additional Requirements</Label>
          <Textarea 
            placeholder="Enter any specific requirements or preferences..."
            className="h-32"
          />
        </div>

        <Button className="w-full">Generate Design Preview</Button>
      </div>
    </div>
  )
}

export default DesignDecisionForm