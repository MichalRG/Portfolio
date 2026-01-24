# Infrstructure Flow:

Request flow:

1. User opens www.mkrzyzowski.com
2. DNS (Route53 A/AAAA alias) resolve traffic to cloudfront
3. CloudFront receive request, it contains www so redirect 301 to apex.
4. CloudFornt check cache if lack of cahce it fetch from 3 origin using OAI.
5. CloudFront adds response header policy
6. Return response to user
