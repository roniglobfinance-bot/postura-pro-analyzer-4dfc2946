import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListChecks, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const StudentRecommendations = () => {
  const { user } = useAuth();
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('ppa_plan_links')
        .select('recommendations, published_at')
        .eq('student_id', user.id)
        .eq('active', true)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(1).maybeSingle();
      setRecs(Array.isArray(data?.recommendations) ? data!.recommendations : []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <Loader2 className="h-4 w-4 animate-spin" />;

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5" /> Recomendações</CardTitle></CardHeader>
      <CardContent>
        {recs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem recomendações publicadas.</p>
        ) : (
          <ul className="space-y-2">
            {recs.map((r: any, i: number) => (
              <li key={i} className="p-3 bg-muted rounded text-sm">
                {typeof r === 'string' ? r : (
                  <>
                    {r.category && <Badge variant="outline" className="mr-2">{r.category}</Badge>}
                    <span>{r.text || r.message}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentRecommendations;
