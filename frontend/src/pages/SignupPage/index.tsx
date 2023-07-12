import React from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function SignupPage() {
  return (
    <div
      style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}
    >
      <h1>회원가입</h1>
      <div style={{display: 'flex'}}>
        <img
          src="/Naengmyeon.png"
          style={{objectFit: 'cover', width: '40px'}}
          alt="냉면사진"
        />
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <span>프로필 사진</span>
          <span>기본 이미지는 인트라 이미지로 설정됩니다</span>
        </div>
      </div>
      {/* intraId, password */}
      <form style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <span>intraID</span>
          <span>naengmyeon</span>
        </div>
        <input type="password" placeholder="비밀번호" />
        <input type="password" placeholder="비밀번호재확인" />
        <span>비밀번호는 아래의 규칙에 맞게 입력해주세요</span>
        <div style={{display: 'flex'}}>
          <input type="checkbox" />
          <span>전체 길이 8~20자 이내</span>
        </div>
        <div style={{display: 'flex'}}>
          <input type="checkbox" />
          <span>영문 대/소문자, 숫자, 특수문자 포함</span>
        </div>
        <div style={{display: 'flex'}}>
          <input type="text" placeholder="닉네임" />
          {/* 중복확인할 기능과 상태 */}
          <button>중복확인</button>
        </div>
        <div style={{display: 'flex'}}>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <span>2차 인증 활성화</span>
            <span>Google Authenticator로 추가 인증합니다</span>
          </div>
          <input type="checkbox" />
        </div>
        <button type="submit">가입하기</button>
      </form>
    </div>
  );
}

export default SignupPage;
