import { useState } from "react";
import { Save, Upload, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [settings, setSettings] = useState({
    businessName: "VideoAdmin Premium",
    contactEmail: "admin@videoadmin.com",
    supportEmail: "support@videoadmin.com",
    platformDescription: "A premium video platform for architecture professionals",
    defaultAccessDuration: "30",
    allowFreeSignup: true,
    requireEmailVerification: true,
    maintenanceMode: false,
    paymeApiKey: "payme_test_key_123456789",
    clickApiKey: "click_test_key_987654321",
    paymeSecret: "payme_secret_abc123def456",
    clickSecret: "click_secret_xyz789uvw012"
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log("Saving settings:", settings);
    // Show success toast
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure your platform settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={settings.businessName}
                onChange={(e) => handleInputChange("businessName", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleInputChange("contactEmail", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleInputChange("supportEmail", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Platform Description</Label>
              <Textarea
                id="description"
                value={settings.platformDescription}
                onChange={(e) => handleInputChange("platformDescription", e.target.value)}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="accessDuration">Default Premium Access Duration (days)</Label>
              <Input
                id="accessDuration"
                type="number"
                value={settings.defaultAccessDuration}
                onChange={(e) => handleInputChange("defaultAccessDuration", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo Upload */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Current Logo</Label>
                <div className="mt-2 w-32 h-32 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">VA</span>
                </div>
              </div>
              
              <div>
                <Label>Upload New Logo</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                  <Button variant="outline" className="mt-2">
                    Choose File
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Settings */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Free Signup</Label>
                <p className="text-sm text-muted-foreground">Enable users to create free accounts</p>
              </div>
              <Switch
                checked={settings.allowFreeSignup}
                onCheckedChange={(checked) => handleInputChange("allowFreeSignup", checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">Users must verify email before access</p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => handleInputChange("requireEmailVerification", checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable public access</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleInputChange("maintenanceMode", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Payment Settings
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiKeys(!showApiKeys)}
              >
                {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="paymeApi">Payme API Key</Label>
              <Input
                id="paymeApi"
                type={showApiKeys ? "text" : "password"}
                value={settings.paymeApiKey}
                onChange={(e) => handleInputChange("paymeApiKey", e.target.value)}
                placeholder="Enter Payme API key"
              />
            </div>
            
            <div>
              <Label htmlFor="paymeSecret">Payme Secret</Label>
              <Input
                id="paymeSecret"
                type={showApiKeys ? "text" : "password"}
                value={settings.paymeSecret}
                onChange={(e) => handleInputChange("paymeSecret", e.target.value)}
                placeholder="Enter Payme secret"
              />
            </div>
            
            <div>
              <Label htmlFor="clickApi">Click API Key</Label>
              <Input
                id="clickApi"
                type={showApiKeys ? "text" : "password"}
                value={settings.clickApiKey}
                onChange={(e) => handleInputChange("clickApiKey", e.target.value)}
                placeholder="Enter Click API key"
              />
            </div>
            
            <div>
              <Label htmlFor="clickSecret">Click Secret</Label>
              <Input
                id="clickSecret"
                type={showApiKeys ? "text" : "password"}
                value={settings.clickSecret}
                onChange={(e) => handleInputChange("clickSecret", e.target.value)}
                placeholder="Enter Click secret"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-gradient-primary">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}