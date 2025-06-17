
import React from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export const AddTank = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add tank creation logic here
    navigate('/');
  };

  return (
    <Layout title="Add New Tank" showBackButton>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Add New Tank</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Tank Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Tank Name</Label>
                <Input id="name" placeholder="e.g. Living Room Reef Tank" />
              </div>
              
              <div>
                <Label htmlFor="size">Tank Size (gallons)</Label>
                <Input id="size" type="number" placeholder="e.g. 75" />
              </div>
              
              <div>
                <Label htmlFor="type">Tank Type</Label>
                <select className="w-full p-2 border rounded">
                  <option value="">Select type</option>
                  <option value="reef">Reef Tank</option>
                  <option value="fowlr">Fish Only with Live Rock</option>
                  <option value="fish-only">Fish Only</option>
                </select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button type="submit">Create Tank</Button>
                <Button type="button" variant="outline" onClick={() => navigate('/')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AddTank;
