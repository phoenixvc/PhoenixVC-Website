import React from "react.js";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const DesignDecisionForm = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Phoenix VC Design Direction</h1>
        <p className="text-gray-600">Align design decisions with our core pillars</p>
      </div>

      <div className="space-y-8">
        {/* Trust & Credibility Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold">Trust & Credibility</h2>
            <Separator className="flex-1" />
          </div>
          
          <div className="grid gap-4">
            <div>
              <Label>Visual Language Priority</Label>
              <Select defaultValue="enterprise">
                <option value="enterprise">Enterprise & Professional</option>
                <option value="modern">Modern & Innovative</option>
                <option value="traditional">Traditional & Established</option>
              </Select>
            </div>

            <div>
              <Label>Content Emphasis</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Track Record Display</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Portfolio Showcase</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Team Credentials</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Industry Recognition</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Innovation & Forward-thinking Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold">Innovation & Forward-thinking</h2>
            <Separator className="flex-1" />
          </div>

          <div className="grid gap-4">
            <div>
              <Label>Interactive Elements</Label>
              <RadioGroup defaultValue="balanced" className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="minimal" id="minimal" />
                  <Label htmlFor="minimal">Minimal & Focused</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="balanced" id="balanced" />
                  <Label htmlFor="balanced">Balanced & Strategic</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dynamic" id="dynamic" />
                  <Label htmlFor="dynamic">Dynamic & Engaging</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Technology Showcase</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Interactive Data Visualization</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Portfolio Analytics</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Market Insights Integration</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Global Reach Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold">Global Reach & Accessibility</h2>
            <Separator className="flex-1" />
          </div>

          <div className="grid gap-4">
            <div>
              <Label>Accessibility Features</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Multi-language Support</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>WCAG 2.1 Compliance</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Regional Content Adaptation</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Time Zone Integration</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Professional Partnership Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold">Professional Partnership</h2>
            <Separator className="flex-1" />
          </div>

          <div className="grid gap-4">
            <div>
              <Label>Communication Channels</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Secure Contact Forms</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Meeting Scheduler</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Document Portal</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Partner Dashboard</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Considerations */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold">Additional Considerations</h2>
            <Separator className="flex-1" />
          </div>

          <Textarea 
            placeholder="Enter any specific requirements or strategic considerations..."
            className="h-32"
          />
        </section>

        <Button className="w-full">Generate Design Guidelines</Button>
      </div>
    </div>
  );
};

export default DesignDecisionForm;