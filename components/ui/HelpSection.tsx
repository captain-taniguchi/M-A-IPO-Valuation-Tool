import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { BookOpen, Calculator, TrendingUp, HelpCircle } from 'lucide-react'

export function HelpSection() {
  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold mb-6">初心者ガイド</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              基本的な考え方
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold mb-1">企業価値とは？</h4>
              <p className="text-sm text-gray-600">
                企業の「値段」を計算することです。家を買う時に適正価格を知りたいのと同じように、企業にも適正な価値があります。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">なぜ重要？</h4>
              <p className="text-sm text-gray-600">
                投資判断、M&A（企業買収）、株式公開時の価格決定など、様々な場面で必要となります。
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              評価方法の選び方
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold mb-1">DCF法を使う場合</h4>
              <p className="text-sm text-gray-600">
                将来の事業計画がある場合。理論的に最も正確ですが、予測が必要です。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">マルチプル法を使う場合</h4>
              <p className="text-sm text-gray-600">
                類似企業と比較したい場合。簡単で分かりやすいが、適切な類似企業の選定が重要です。
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              良い数値の目安
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="text-sm space-y-2">
              <li><span className="font-semibold">ROE:</span> 10%以上（日本企業）、15%以上（優良企業）</li>
              <li><span className="font-semibold">ROA:</span> 5%以上（効率的な資産運用）</li>
              <li><span className="font-semibold">PER:</span> 15-20倍（適正水準）、業界により異なる</li>
              <li><span className="font-semibold">PBR:</span> 1倍以上（理論的な下限値）</li>
              <li><span className="font-semibold">割引率:</span> 8-12%（一般的な範囲）</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              よくある質問
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold mb-1">Q: どのデータを使えばいい？</h4>
              <p className="text-sm text-gray-600">
                A: 決算短信や有価証券報告書から入手できます。最新の年度データを使用しましょう。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Q: 計算結果の妥当性は？</h4>
              <p className="text-sm text-gray-600">
                A: 複数の方法で計算し、結果を比較することで妥当性を確認できます。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}