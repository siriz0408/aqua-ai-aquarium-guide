
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/hooks/useCredits';
import { User, Settings, CreditCard, Crown, Zap } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export const UserProfileButton: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile, getRemainingCredits, getUserPlanType } = useCredits();
  const navigate = useNavigate();

  if (!user) return null;

  const displayCredits = getRemainingCredits();
  const planType = getUserPlanType();

  const getPlanBadge = () => {
    switch (planType) {
      case 'super_admin':
        return <Badge variant="default" className="bg-red-600"><Crown className="h-3 w-3 mr-1" />Super Admin</Badge>;
      case 'admin':
        return <Badge variant="default" className="bg-orange-600"><Settings className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'premium':
        return <Badge variant="default" className="bg-purple-600"><Crown className="h-3 w-3 mr-1" />Premium</Badge>;
      case 'basic':
        return <Badge variant="outline"><Zap className="h-3 w-3 mr-1" />Basic</Badge>;
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {getPlanBadge()}
              {displayCredits !== null && (
                <Badge variant="outline" className="text-xs">
                  {displayCredits} credits
                </Badge>
              )}
              {displayCredits === null && (
                <Badge variant="outline" className="text-xs">
                  Unlimited
                </Badge>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileClick}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile & Settings</span>
        </DropdownMenuItem>
        {planType !== 'premium' && planType !== 'super_admin' && planType !== 'admin' && (
          <DropdownMenuItem onClick={() => navigate('/pricing')}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Upgrade Plan</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
