import test from 'node:test'
import assert from 'node:assert/strict'
import {capturePasswordLink} from '../src/lib/passwordLink.ts'

for (const type of ['invite','recovery']) test(type + ' establishes only the verified recipient session and exchanges once', async () => {
  let cleaned = 0, calls = 0
  const link = capturePasswordLink(new URL('https://preview.example/reset-password#type='+type+'&token_hash=fixture'), () => ++cleaned)
  const auth = { async verifyOtp(params) {
    calls++; assert.deepEqual(params,{type,token_hash:'fixture'})
    return {data:{session:{user:{id:'fixture-recipient'}}}}
  }}
  assert.equal(cleaned,1)
  assert.deepEqual(await Promise.all([link.verify(auth),link.verify(auth)]),['fixture-recipient','fixture-recipient'])
  assert.equal(calls,1); link.finish(); await assert.rejects(link.verify(auth))
})

test('invalid, expired or mismatched links cannot use a previous login', async () => {
  const auth = { initialize: async()=>({}), getSession:async()=>({data:{session:{access_token:'old',user:{id:'previous'}}}}),
    verifyOtp:async()=>({data:{session:null},error:Error()}), exchangeCodeForSession:async()=>({data:{session:null},error:Error()}) }
  for (const tail of ['#type=invite&access_token=different','#type=invite&token_hash=expired','?code=invalid','#error_code=otp_expired'])
    await assert.rejects(capturePasswordLink(new URL('https://preview.example/reset-password'+tail),()=>{}).verify(auth))
  assert.equal(capturePasswordLink(new URL('https://preview.example/reset-password'),()=>{}),null)
})

test('Supabase SDK verifies invite and recovery, installs a session and uses it to update the recipient', async () => {
  const {createClient} = await import('@supabase/supabase-js')
  for (const type of ['invite','recovery']) {
    const user = {id:crypto.randomUUID(),aud:'authenticated',role:'authenticated'}
    const token = ['header',Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),'fixture'].join('.')
    let updates = 0
    const auth = createClient('https://fixture.invalid','fixture-public',{auth:{persistSession:false,autoRefreshToken:false},global:{
      fetch:async(input,init)=>{
        const path = new URL(input).pathname
        let body
        if(path==='/auth/v1/verify'){
          assert.equal(JSON.parse(init.body).type,type)
          body = {access_token:token,refresh_token:'fixture',expires_in:3600,token_type:'bearer',user}
        } else {
          assert.equal(path,'/auth/v1/user')
          assert.equal(new Headers(init.headers).get('authorization'),'Bearer '+token)
          if(init.method==='PUT') updates++
          body=user
        }
        return new Response(JSON.stringify(body),{headers:{'Content-Type':'application/json'}})
      }
    }}).auth
    const link=capturePasswordLink(new URL('https://preview.example/reset-password#type='+type+'&token_hash=fixture'),()=>{})
    assert.equal(await link.verify(auth),user.id)
    assert.equal((await auth.getUser()).data.user.id,user.id)
    assert.equal((await auth.updateUser({password:crypto.randomUUID()})).error,null)
    assert.equal(updates,1)
    link.finish()
  }
})
